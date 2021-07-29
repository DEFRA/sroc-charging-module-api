'use strict'

const { LicenceModel, InvoiceModel } = require('../../../app/models')

const NewInvoiceHelper = require('./new_invoice.helper')

class NewLicenceHelper {
  /**
   * Create a licence
   *
   * @param {string} [invoiceId] Id to use for the `invoice_id` field. If not specified then a new invoice will be
   *  created.
   * @param {object} [overrides] JSON object of values which will override the ones the helper defaults to.
   *
   * @returns {module:LicenceModel} The newly created instance of `LicenceModel`.
   */

  static async addLicence (invoiceId, overrides) {
    if (!invoiceId) {
      const invoice = await NewInvoiceHelper.addInvoice()
      invoiceId = invoice.id
    }

    const licenceValues = {
      ...this._defaultLicence(),
      ...overrides
    }

    return LicenceModel.query()
      .insert({
        invoiceId,
        billRunId: await this._billRunId(invoiceId),
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

  static async _billRunId (invoiceId) {
    const invoice = await InvoiceModel.query().findById(invoiceId)
    return invoice.billRunId
  }
}

module.exports = NewLicenceHelper
