'use strict'

/**
 * @module DeleteLicenceService
 */

const { LicenceModel } = require('../models')

class DeleteLicenceService {
  /**
   * Deletes a licence along with its transactions and updates the invoice accordingly. Intended to be run as a
   * background task by a controller, ie. called without an await. Note that the licence will _not_ be validated to
   * ensure it is linked to the bill run; it is expected that this will be done from the calling controller so that it
   * can present the appropriate error to the user immediately.
   *
   * The invoice will be updated by subtracting the licence's credit/debit line count/value etc. and updating the zero
   * value and deminimis invoice flags. Note that this will be done regardless of whether or not the bill run has been
   * generated.
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

        await this._handleInvoice(licence, trx)
      })
    } catch (error) {
      notifier.omfg('Error deleting licence', { id: licence.id, error })
    }
  }

  /**
   * Patches the specified invoice if there are licences remaining on it, otherwise it deletes the invoice
   */
  static async _handleInvoice (licence, trx) {
    const invoice = await licence.$relatedQuery('invoice', trx)
    const licences = await invoice.$relatedQuery('licences', trx)

    if (licences.length) {
      this._updateInstance(invoice, licence)
      const invoicePatch = this._invoicePatch(licence, invoice)
      await invoice.$query(trx).patch(invoicePatch)
    } else {
      // TODO: Replace this with DeleteInvoiceService to ensure bill run level stats are updated
      await invoice.$query(trx).delete()
    }
  }

  static _invoicePatch (licence, invoice) {
    return {
      creditLineCount: invoice.creditLineCount,
      creditLineValue: invoice.creditLineValue,
      debitLineCount: invoice.debitLineCount,
      debitLineValue: invoice.debitLineValue,
      zeroLineCount: invoice.zeroLineCount,
      subjectToMinimumChargeCount: invoice.subjectToMinimumChargeCount,
      subjectToMinimumChargeCreditValue: invoice.subjectToMinimumChargeCreditValue,
      subjectToMinimumChargeDebitValue: invoice.subjectToMinimumChargeDebitValue,
      zeroValueInvoice: invoice.$zeroValueInvoice(),
      deminimisInvoice: invoice.$deminimisInvoice(),
      minimumChargeInvoice: invoice.$minimumChargeInvoice()
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
}

module.exports = DeleteLicenceService
