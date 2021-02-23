'use strict'

const { LicenceModel } = require('../../../app/models')

const InvoiceHelper = require('./invoice.helper')

class LicenceHelper {
  /**
   * Create a licence. If invoiceId is null the values of customerReference and financialYear will be used to create a
   * new invoice for this licence to belong to, avoiding foreign key violations.
   *
   * @param {string} billRunId Id to use for the `bill_run_id` field
   * @param {string} licenceNumber String to use for the `licence_number` field.
   * @param {string} [invoiceId] Id to use for the `invoice_id` field. If empty then a new invoice will be created.
   * @param {string} [customerReference] Customer reference to use if an invoice is to be created.
   * @param {integer} [financialYear] Financial year to use if an invoice is to be created.
   *
   * @returns {module:LicenceModel} The newly created instance of `LicenceModel`.
   */
  static async addLicence (
    billRunId,
    licenceNumber,
    invoiceId = '',
    customerReference = '',
    financialYear = ''
  ) {
    return LicenceModel.query()
      .insert({
        billRunId,
        licenceNumber,
        invoiceId: await this._invoice(invoiceId, billRunId, customerReference, financialYear)
      })
      .returning('*')
  }

  static async _invoice (invoiceId, billRunId, customerReference, financialYear) {
    if (invoiceId) {
      return invoiceId
    }

    const invoice = await InvoiceHelper.addInvoice(billRunId, customerReference, financialYear)
    return invoice.id
  }
}

module.exports = LicenceHelper
