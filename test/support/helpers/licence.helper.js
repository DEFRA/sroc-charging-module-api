import InvoiceHelper from './invoice.helper.js'
import LicenceModel from '../../../app/models/licence.model.js'

export default class LicenceHelper {
  /**
   * Create a licence. If invoiceId is null the values of customerReference and financialYear will be used to create a
   * new invoice for this licence to belong to, avoiding foreign key violations.
   *
   * @param {string} billRunId Id to use for the `bill_run_id` field
   * @param {string} licenceNumber String to use for the `licence_number` field.
   * @param {string} [invoiceId] Id to use for the `invoice_id` field. If empty then a new invoice will be created.
   * @param {string} [customerReference] Customer reference to use if an invoice is to be created.
   * @param {integer} [financialYear] Financial year to use if an invoice is to be created.
   * @param {integer} [creditLineCount] Number of credits in the licence.
   * @param {integer} [creditLineValue] Total value of credits in the licence.
   * @param {integer} [debitLineCount] Number of debits in the licence.
   * @param {integer} [debitLineValue] Total value of debits in the licence.
   * @param {integer} [zeroLineCount] Number of zero value transactions in the licence.
   * @param {integer} [subjectToMinimumChargeCount] Number of transactions flagged as 'miniumum charge' in the licence.
   * @param {integer} [subjectToMinimumChargeCreditValue] Total value of minimum charge credit transactions in the
   *  licence.
   * @param {integer} [subjectToMinimumChargeDebitValue] Total value of minimum charge debit transactions in the
   *  licence.
   *
   * @returns {module:LicenceModel} The newly created instance of `LicenceModel`.
   */
  static async addLicence (
    billRunId,
    licenceNumber,
    invoiceId = '',
    customerReference = '',
    financialYear = '',
    creditLineCount = 0,
    creditLineValue = 0,
    debitLineCount = 0,
    debitLineValue = 0,
    zeroLineCount = 0,
    subjectToMinimumChargeCount = 0,
    subjectToMinimumChargeCreditValue = 0,
    subjectToMinimumChargeDebitValue = 0
  ) {
    return LicenceModel.query()
      .insert({
        billRunId,
        licenceNumber,
        invoiceId: await this._invoiceId(invoiceId, billRunId, customerReference, financialYear),
        creditLineCount,
        creditLineValue,
        debitLineCount,
        debitLineValue,
        zeroLineCount,
        subjectToMinimumChargeCount,
        subjectToMinimumChargeCreditValue,
        subjectToMinimumChargeDebitValue
      })
      .returning('*')
  }

  static async _invoiceId (invoiceId, billRunId, customerReference, financialYear) {
    if (invoiceId) {
      return invoiceId
    }

    const invoice = await InvoiceHelper.addInvoice(billRunId, customerReference, financialYear)
    return invoice.id
  }
}
