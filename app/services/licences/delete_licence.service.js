'use strict'

/**
 * @module DeleteLicenceService
 */

const { LicenceModel } = require('../../models')

const DeleteInvoiceService = require('../invoices/delete_invoice.service')

class DeleteLicenceService {
  /**
   * Deletes a licence along with its transactions and updates the invoice accordingly. Intended to be run as a
   * background task by a controller, ie. called without an await. While the licence is being deleted, the bill run's
   * status will be set to `pending`, and restored to its original status afterwards. Note that the licence will _not_
   * be validated to ensure it is linked to the bill run; it is expected that this will be done from the calling
   * controller so that it can present the appropriate error to the user immediately.
   *
   * The invoice will be updated by subtracting the licence's credit/debit line count/value etc. and updating the zero
   * value, deminimis and minimum charge invoice flags. Note that this will be done regardless of whether or not the
   * bill run has been generated.
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
        const { status: initialBillRunStatus } = billRun

        await this._setBillRunStatusPending(billRun, trx)
        await this._deleteLicence(licence, notifier, initialBillRunStatus, trx)
        await this._revertBillRunStatus(billRun, initialBillRunStatus, trx)
      })
    } catch (error) {
      notifier.omfg('Error deleting licence', { id: licence.id, error })
    }
  }

  static async _setBillRunStatusPending (billRun, trx) {
    await billRun
      .$query(trx)
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

  static async _deleteLicence (licence, notifier, initialBillRunStatus, trx) {
    // We only need to delete the licence as it will cascade down to the transaction level.
    await LicenceModel
      .query(trx)
      .deleteById(licence.id)

    const invoice = await licence.$relatedQuery('invoice', trx)
    const licences = await invoice.$relatedQuery('licences', trx)
    // Even though the service received the bill run, we query again to refresh it
    const billRun = await licence.$relatedQuery('billRun', trx)

    if (licences.length) {
      // Store the invoice's current transaction type (C=Credit, I=Invoice) as we may need it to adjust the bill run
      const invoiceTransactionType = this._transactionType(invoice)
      const invoiceNetTotal = invoice.$netTotal()
      await this._handleInvoice(billRun, invoice, licence, trx)
      await this._handleBillRun(billRun, invoice, licence, invoiceTransactionType, invoiceNetTotal, initialBillRunStatus, trx)
    } else {
      await DeleteInvoiceService.go(invoice, billRun, notifier, trx)
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
  static async _handleBillRun (billRun, invoice, licence, invoiceTransactionType, previousNetTotal, initialBillRunStatus, trx) {
    this._updateBillRunInstance(billRun, invoice, licence, invoiceTransactionType, previousNetTotal, initialBillRunStatus)
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
   * Updates the bill run instance by first calling _updateInstance to update the standard fields, then updates two
   * additional fields unique to the bill run, and finally adjusts the credit note/invoice count if the invoice that
   * the licence belongs to is now zero value.
   */
  static _updateBillRunInstance (billRun, invoice, licence, previousTransactionType, previousInvoiceNetTotal, initialBillRunStatus) {
    this._updateInstance(billRun, licence)

    // We only update the bill run stats if the bill run is generated
    if (initialBillRunStatus !== 'generated') {
      return
    }

    const currentLicenceNetTotal = licence.$netTotal()
    const currentInvoiceNetTotal = invoice.$netTotal()
    const currentTransactionType = this._transactionType(invoice)

    /**
     * if the updated invoice was a credit note and is still a credit note then subtract the licence net total from billRun.creditNoteValue
     * if the updated invoice was an invoice and still is an invoice then subtract the licence net total from billRun.invoiceValue
     * if the updated invoice was a credit note but is now an invoice then subtract net total from creditNoteValue and add to invoiceValue
     *  and subtract 1 from creditNoteCount and increment invoiceCount
     * if the updated invoice was an invoice but is now a credit note then subtract net total from invoiceValue and add to creditNoteValue
     *  and subtract 1 from invoiceCount and increment creditNoteCount
     * if the updated invoice was a credit note but is now zero value then subtract net total from creditNoteValue
     *  and subtract 1 from creditNoteCount
     * if the updated invoice was an invoice but is now zero value then subtract net total from invoiceValue
     *  and subtract 1 from invoiceCount
     */

    if (previousTransactionType === 'C' && currentTransactionType === 'C') {
      billRun.creditNoteValue += currentLicenceNetTotal
    }

    if (previousTransactionType === 'C' && currentTransactionType === 'I') {
      billRun.creditNoteValue += previousInvoiceNetTotal
      billRun.invoiceValue += currentInvoiceNetTotal
      billRun.creditNoteCount -= 1
      billRun.invoiceCount += 1
    }

    if (previousTransactionType === 'C' && currentTransactionType === 'Z') {
      billRun.creditNoteValue -= previousInvoiceNetTotal
      billRun.creditNoteCount -= 1
    }

    if (previousTransactionType === 'I' && currentTransactionType === 'I') {
      billRun.invoiceValue -= currentLicenceNetTotal
    }

    if (previousTransactionType === 'I' && currentTransactionType === 'C') {
      billRun.invoiceValue -= previousInvoiceNetTotal
      billRun.creditNoteValue -= currentInvoiceNetTotal
      billRun.invoiceCount -= 1
      billRun.creditNoteCount += 1
    }

    if (previousTransactionType === 'I' && currentTransactionType === 'Z') {
      billRun.invoiceValue -= previousInvoiceNetTotal
      billRun.invoiceCount -= 1
    }

    if (previousTransactionType === 'Z' && currentTransactionType === 'Z') {
      // Nothing needed
    }

    if (previousTransactionType === 'Z' && currentTransactionType === 'I') {
      billRun.invoiceValue += currentInvoiceNetTotal
      billRun.invoiceCount += 1
    }

    if (previousTransactionType === 'Z' && currentTransactionType === 'C') {
      billRun.creditNoteCount += 1
      billRun.creditNoteValue -= currentInvoiceNetTotal
    }
  }

  /**
   * Returns 'C' if the invoice is a credit, 'I' if it is a debit, and 'Z' if it is zero value
   */
  static _transactionType (invoice) {
    return invoice.$zeroValueInvoice() ? 'Z' : invoice.$transactionType()
  }
}

module.exports = DeleteLicenceService
