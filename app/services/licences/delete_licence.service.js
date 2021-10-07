'use strict'

/**
 * @module DeleteLicenceService
 */

const { LicenceModel } = require('../../models')

const DeleteInvoiceService = require('../invoices/delete_invoice.service')

class DeleteLicenceService {
  /**
   * Deletes a licence along with its transactions and updates the invoice and bill run accordingly. Intended to be run
   * as a background task by a controller, ie. called without an await. While the licence is being deleted, the bill
   * run's status will be set to `pending`, and restored to its original status afterwards. Note that the licence will
   * _not_ be validated to ensure it is linked to the bill run; it is expected that this will be done from the calling
   * controller so that it can present the appropriate error to the user immediately.
   *
   * The invoice will be updated by subtracting the licence's credit/debit line count/value etc. and updating the zero
   * value, deminimis and minimum charge invoice flags. Note that this will be done regardless of whether or not the
   * bill run has been generated.
   *
   * If the bill run has been generated then the credit note/invoice count and value fields will be updated.
   *
   * @param {module:LicenceModel} licence The licence to be deleted.
   * @param {module:BillRunModel} billRun The bill run the licence belongs to, which we use to determine its current
   * status.
   * @param {@module:RequestNotifierLib} notifier Instance of `RequestNotifierLib` class. We use it to log errors rather
   * than throwing them as this service is intended to run in the background.
   */
  static async go (licence, billRun, notifier) {
    try {
      await LicenceModel.transaction(async trx => {
        // We need to know the bill run's initial status before it's set to `pending`
        const { status: initialStatus } = billRun

        await this._setBillRunStatusPending(billRun)
        await this._deleteLicence(licence, notifier, initialStatus, trx)
        await this._revertBillRunStatus(billRun, initialStatus, trx)
      })
    } catch (error) {
      notifier.omfg('Error deleting licence', { id: licence.id, error })
    }
  }

  static async _setBillRunStatusPending (billRun) {
    await billRun
      .$query()
      .patch({ status: 'pending' })
  }

  // Reverts the bill run status, but only if it is 'pending'. This means it won't be touched if the status changed during
  // deletion (ie. to 'initialised' due to the bill run being empty following deletion of the licence).
  static async _revertBillRunStatus (billRun, status, trx) {
    await billRun
      .$query(trx)
      .select('pending')
      .patch({ status })
  }

  static async _getCurrentBillRunStatus (billRun, trx) {
    const { status } = await billRun
      .$query(trx)
      .select('status')

    return status
  }

  static async _deleteLicence (licence, notifier, initialStatus, trx) {
    // We only need to delete the licence as it will cascade down to the transaction level.
    await LicenceModel
      .query(trx)
      .deleteById(licence.id)

    const invoice = await licence.$relatedQuery('invoice', trx)
    const licences = await invoice.$relatedQuery('licences', trx)
    // Even though the service received the bill run, we query again to refresh it
    const billRun = await licence.$relatedQuery('billRun', trx)

    if (licences.length) {
      const previousInvoice = invoice.$clone()
      await this._handleInvoice(billRun, invoice, licence, trx)
      await this._handleBillRun(billRun, invoice, licence, previousInvoice, initialStatus, trx)
    } else {
      await DeleteInvoiceService.go(invoice, billRun, notifier, initialStatus, trx)
    }
  }

  /**
   * Updates the invoice instance that the licence belongs to, then uses the updated fields to generate a patch which is
   * applied to the invoice in the db.
   */
  static async _handleInvoice (billRun, invoice, licence, trx) {
    this._updateInstance(invoice, licence)
    const minimumChargeInvoice = await this._determineMinimumChargeInvoice(billRun, invoice, trx)
    const invoicePatch = this._invoicePatch(invoice, minimumChargeInvoice)
    await invoice.$query(trx).patch(invoicePatch)
  }

  /**
   * Updates the bill run instance that the licence belongs to, then uses the updated fields to generate a patch which
   * is applied to the bill run in the db.
   */
  static async _handleBillRun (billRun, invoice, licence, previousInvoice, initialStatus, trx) {
    this._updateInstance(billRun, licence)

    // We only need to update the bill run instance if it's been generated
    if (initialStatus === 'generated') {
      this._updateBillRunInstance(billRun, invoice, previousInvoice)
    }

    const billRunPatch = this._billRunPatch(billRun)
    await billRun.$query(trx).patch(billRunPatch)
  }

  /**
   * Creates a patch for the invoice using the fields in _entityPatch (which are common to both invoice and bill run),
   * and then adds in additional fields based on the invoice's static methods.
   */
  static _invoicePatch (invoice, minimumChargeInvoice) {
    return {
      ...this._entityPatch(invoice),
      zeroValueInvoice: invoice.$zeroValueInvoice(),
      deminimisInvoice: invoice.$deminimisInvoice(),
      minimumChargeInvoice
    }
  }

  /**
   * Determine whether the connected invoice is still a minimum charge invoice
   *
   * When transactions are added to a bill run they can be flagged as 'subject to minimum charge'. It does not mean the
   * resulting invoice _will_ be minimum charge because it all depends on whether the combined value is less than £25.
   * If it is we add a minimum charge adjustment transaction to the invoice as part of 'generating' the bill run and
   * this is when we flag it as a **minimum charge invoice**.
   *
   * Deleting a licence might result in the minimum charge adjustments being deleted. But this will only be relevant to
   * generated bill runs. All this complexity means we need a method to determine what the `minimumChargeInvoice` field
   * on the connected invoice needs to be set to.
   *
   * @param {module:BillRunModel} billRun The bill run the licence was deleted from. Used to get the bill run status
   * @param {module:InvoiceModel} invoice The invoice the licence was deleted from.
   *
   * @returns {boolean} the value to set `minimumChargeInvoice` to (either `true` or `false`)
   */
  static async _determineMinimumChargeInvoice (billRun, invoice, trx) {
    if (billRun.status === 'initialised') {
      // We only set minimumChargeInvoice to true during the generate process when minimum charge adjustment
      // transactions are added by us. So, if the bill run is `initialised` it will _always_ be false
      return false
    }

    if (invoice.subjectToMinimumChargeCount <= 0) {
      // If subjectToMinimumChargeCount is 0 then even if 'generated' we would not have looked at creating minimum
      // charge adjustment transactions for the invoice
      return false
    }

    const result = await invoice
      .$relatedQuery('transactions', trx)
      .where('minimumChargeAdjustment', true)
      .count()
      .first()

    return result.count > 0
  }

  /**
   * Creates a patch for the bill run using the fields in _entityPatch (which are common to both invoice and bill run),
   * and then adds in additional fields based on the invoice's static methods.
   */
  static _billRunPatch (billRun) {
    return {
      ...this._entityPatch(billRun),
      creditNoteCount: billRun.creditNoteCount,
      creditNoteValue: billRun.creditNoteValue,
      invoiceCount: billRun.invoiceCount,
      invoiceValue: billRun.invoiceValue
    }
  }

  static _entityPatch (entity) {
    return {
      creditLineCount: entity.creditLineCount,
      creditLineValue: entity.creditLineValue,
      debitLineCount: entity.debitLineCount,
      debitLineValue: entity.debitLineValue,
      zeroLineCount: entity.zeroLineCount,
      subjectToMinimumChargeCount: entity.subjectToMinimumChargeCount,
      subjectToMinimumChargeCreditValue: entity.subjectToMinimumChargeCreditValue,
      subjectToMinimumChargeDebitValue: entity.subjectToMinimumChargeDebitValue
    }
  }

  /**
   * Receives an entity (ie. an invoice or a bill run) and subtracts the licence's stats from the entity's stats. We
   * update the figures on the instance in this way so we can then use the entity's instance methods to determine
   * whether deminimis etc. applies and then persist the values and flags in one go.
   */
  static _updateInstance (entity, licence) {
    entity.creditLineCount -= licence.creditLineCount
    entity.creditLineValue -= licence.creditLineValue
    entity.debitLineCount -= licence.debitLineCount
    entity.debitLineValue -= licence.debitLineValue
    entity.zeroLineCount -= licence.zeroLineCount
    entity.subjectToMinimumChargeCount -= licence.subjectToMinimumChargeCount
    entity.subjectToMinimumChargeCreditValue -= licence.subjectToMinimumChargeCreditValue
    entity.subjectToMinimumChargeDebitValue -= licence.subjectToMinimumChargeDebitValue
  }

  /**
   * Updates the bill run instance by removing the previous invoice net total from the appropriate credit/invoice field
   * (based on whether the previous invoice was overall credit or invoice) and decrementing the appropriate count by 1;
   * and then adding the new net invoice total to the appropriate credit/invoice field (based on whether the invoice is
   * now overall credit or invoice) and incrementing the count by 1.
   */
  static _updateBillRunInstance (billRun, updatedInvoice, previousInvoice) {
    const previousTransactionType = this._transactionType(previousInvoice)
    const currentTransactionType = this._transactionType(updatedInvoice)

    // If the old invoice isn't deminimis, remove its value from the appropriate bill run field and adjust the count
    if (!previousInvoice.$deminimisInvoice()) {
      if (previousTransactionType === 'C') {
        billRun.creditNoteCount -= 1
        billRun.creditNoteValue -= previousInvoice.$absoluteNetTotal()
      }
      if (previousTransactionType === 'I') {
        billRun.invoiceCount -= 1
        billRun.invoiceValue -= previousInvoice.$absoluteNetTotal()
      }
    }

    // If the updated invoice isn't deminimis, add its value to the appropriate bill run field and adjust the count
    if (!updatedInvoice.$deminimisInvoice()) {
      if (currentTransactionType === 'C') {
        billRun.creditNoteCount += 1
        billRun.creditNoteValue += updatedInvoice.$absoluteNetTotal()
      }
      if (currentTransactionType === 'I') {
        billRun.invoiceCount += 1
        billRun.invoiceValue += updatedInvoice.$absoluteNetTotal()
      }
    }
  }

  /**
   * Returns 'C' if the invoice is a credit, 'I' if it is a debit, and 'Z' if it is zero value. The regular
   * $transactionType() method will return 'I' if it has a net value of 0 (ie. is zero value) so we need this helper
   * method so we can distinguish between a debit and zero value.
   */
  static _transactionType (invoice) {
    return invoice.$zeroValueInvoice() ? 'Z' : invoice.$transactionType()
  }
}

module.exports = DeleteLicenceService
