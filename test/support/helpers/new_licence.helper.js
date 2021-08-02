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
  static async add (invoice, overrides) {
    if (!invoice) {
      invoice = await NewInvoiceHelper.add()
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

  /**
   * Updates a licence
   *
   * @param {module:LicenceModel} licence The licence to be updated.
   * @param {object} updates JSON object of values to be updated. Each value in the object will be added to the existing
   *  value in the licence.
   *
   * @returns {module:LicenceModel} The newly updated instance of `LicenceModel`.
   */
  static async update (licence, updates = {}) {
    const patch = {}

    for (const key in updates) {
      patch[key] = licence[key] + updates[key]
    }

    return licence.$query()
      .patchAndFetch(patch)
  }
}

module.exports = NewLicenceHelper
