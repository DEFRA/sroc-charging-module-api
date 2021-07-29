'use strict'

const { LicenceModel } = require('../../../app/models')

const NewInvoiceHelper = require('./new_invoice.helper')

class NewLicenceHelper {
  /**
   * Create a licence
   *
   * @param {module:InvoiceModel} [invoice] Invoice the licence is to be created on. If not specified then a new invoice
   *  will be created.
   * @param {object} [overrides] JSON object of values which will override the ones the helper defaults to.
   *
   * @returns {module:LicenceModel} The newly created instance of `LicenceModel`.
   */

  static async addLicence (invoice, overrides) {
    if (!invoice) {
      invoice = await NewInvoiceHelper.addInvoice()
    }

    const licenceValues = {
      ...this._defaultLicence(),
      ...overrides
    }

    return LicenceModel.query()
      .insert({
        invoiceId: invoice.id,
        billRunId: invoice.billRunId,
        ...licenceValues
      })
      .returning('*')
  }

  static _defaultLicence () {
    return {
      licenceNumber: 'LICENCE_NUMBER',
      creditLineCount: 0,
      creditLineValue: 0,
      debitLineCount: 0,
      debitLineValue: 0,
      zeroLineCount: 0,
      subjectToMinimumChargeCount: 0,
      subjectToMinimumChargeCreditValue: 0,
      subjectToMinimumChargeDebitValue: 0
    }
  }
}

module.exports = NewLicenceHelper
