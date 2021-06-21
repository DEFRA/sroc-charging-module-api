'use strict'

/**
 * @module DeleteLicenceService
 */

const { LicenceModel } = require('../models')

const DeleteInvoiceService = require('./delete_invoice.service')

class DeleteLicenceService {
  /**
   * Deletes a licence along with its transactions and updates the invoice accordingly. Intended to be run as a
   * background task by a controller, ie. called without an await. Note that the licence will _not_ be validated to
   * ensure it is linked to the bill run; it is expected that this will be done from the calling controller so that it
   * can present the appropriate error to the user immediately.
   *
   * The invoice will be updated by subtracting the licence's credit/debit line count/value etc. and updating the zero
   * value, deminimis and minimum charge invoice flags. Note that this will be done regardless of whether or not the
   * bill run has been generated.
   *
   * @param {module:LicenceModel} licence The licence to be deleted.
   * @param {@module:RequestNotifierLib} notifier Instance of `RequestNotifierLib` class. We use it to log errors rather
   * than throwing them as this service is intended to run in the background.
   */
  static async go (licence, notifier) {
    try {
      await LicenceModel.transaction(async trx => {
        // We only need to delete the licence as it will cascade down to the transaction level.
        await LicenceModel
          .query(trx)
          .deleteById(licence.id)

        const invoice = await licence.$relatedQuery('invoice', trx)
        const licences = await invoice.$relatedQuery('licences', trx)
        const billRun = await licence.$relatedQuery('billRun', trx)

        if (licences.length) {
          await this._handleInvoice(invoice, licence, trx)
          await this._handleBillRun(billRun, licence, trx)
        } else {
          await DeleteInvoiceService.go(invoice, billRun.id, notifier, trx)
        }
      })
    } catch (error) {
      notifier.omfg('Error deleting licence', { id: licence.id, error })
    }
  }

  /**
   * Patches the invoice that the specified licence belongs to
   */
  static async _handleInvoice (invoice, licence, trx) {
    this._updateInstance(invoice, licence)
    const invoicePatch = this._invoicePatch(invoice)
    await invoice.$query(trx).patch(invoicePatch)
  }

  /**
   * Patches the bill run that the specified licence belongs to
   */
  static async _handleBillRun (billRun, licence, trx) {
    this._updateBillRunInstance(billRun, licence)
    const billRunPatch = this._billRunPatch(billRun)
    await billRun.$query(trx).patch(billRunPatch)
  }

  static _invoicePatch (invoice) {
    return {
      ...this._entityPatch(invoice),
      zeroValueInvoice: invoice.$zeroValueInvoice(),
      deminimisInvoice: invoice.$deminimisInvoice(),
      minimumChargeInvoice: invoice.$minimumChargeInvoice()
    }
  }

  static _billRunPatch (billRun) {
    return {
      ...this._entityPatch(billRun),
      creditNoteCount: billRun.creditNoteCount,
      creditNoteValue: billRun.crediteNoteValue,
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
    // Define the fields to be updated and for each one, subtract the licence value from the entity value
    const fieldsToUpdate = [
      'creditLineCount',
      'creditLineValue',
      'debitLineCount',
      'debitLineValue',
      'zeroLineCount',
      'subjectToMinimumChargeCount',
      'subjectToMinimumChargeCreditValue',
      'subjectToMinimumChargeDebitValue'
    ]

    fieldsToUpdate.forEach(field => {
      entity[field] -= licence[field]
    })
  }

  /**
   * Updates the bill run instance by first calling _updateInstance to update the standard fields, then updates two
   * additional fields unique to the bill run.
   */
  static _updateBillRunInstance (billRun, licence) {
    this._updateInstance(billRun, licence)
    billRun.creditNoteValue -= licence.creditLineValue
    billRun.invoiceValue -= licence.debitLineValue
  }
}

module.exports = DeleteLicenceService
