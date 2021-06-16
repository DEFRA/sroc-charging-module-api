'use strict'

/**
 * @module DeleteLicenceService
 */

const { LicenceModel } = require('../models')
const { raw } = require('../models/base.model')

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
   * @param {@module:RequestNotifier} notifier Instance of `RequestNotifier` class. We use it to log errors rather than
   * throwing them as this service is intended to run in the background.
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
      const invoicePatch = this._invoicePatch(licence, invoice)
      await invoice.$query(trx).patch(invoicePatch)
    } else {
      // TODO: Replace this with DeleteInvoiceService to ensure bill run level stats are updated
      await invoice.$query(trx).delete()
    }
  }

  static _invoicePatch (licence, invoice) {
    return {
      ...this._basePatch(licence),
      zeroValueInvoice: invoice.$zeroValueInvoice(),
      deminimisInvoice: invoice.$deminimisInvoice()
    }
  }

  /**
   * Base patch which we will apply at the invoice and bill run level. The fields to change at the two levels are the
   * same and will be adjusted in the same way; the intent is that the functions to apply the patch will take this base
   * patch and add in the fields specific to the invoice or bill run level.
   */
  static _basePatch (licence) {
    return {
      creditLineCount: raw('credit_line_count - ?', licence.creditLineCount),
      creditLineValue: raw('credit_line_value - ?', licence.creditLineValue),
      debitLineCount: raw('debit_line_count - ?', licence.debitLineCount),
      debitLineValue: raw('debit_line_value - ?', licence.debitLineValue),
      zeroLineCount: raw('zero_line_count - ?', licence.zeroLineCount),
      subjectToMinimumChargeCount: raw('subject_to_minimum_charge_count - ?', licence.subjectToMinimumChargeCount),
      subjectToMinimumChargeCreditValue: raw('subject_to_minimum_charge_credit_value - ?', licence.subjectToMinimumChargeCreditValue),
      subjectToMinimumChargeDebitValue: raw('subject_to_minimum_charge_debit_value - ?', licence.subjectToMinimumChargeDebitValue)
    }
  }
}

module.exports = DeleteLicenceService
