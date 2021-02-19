'use strict'

const { InvoiceModel } = require('../../../app/models')

class InvoiceHelper {
  /**
   * Create an invoice
   *
   * @param {string} billRunId Id to use for the `bill_run_id` field
   * @param {string} customerReference Customer reference to use.
   * @param {integer} financialYear Financial year to use.
   * @param {integer} [creditLineCount] Number of credits in the invoice.
   * @param {integer} [creditLineValue] Total value of credits in the invoice.
   * @param {integer} [debitLineCount] Number of debits in the invoice.
   * @param {integer} [debitLineValue] Total value of debits in the invoice.
   * @param {integer} [zeroLineCount] Number of zero value transactions in the invoice.
   * @param {integer} [subjectToMinimumChargeCount] Number of transactions flagged as 'miniumum charge' in the invoice.
   * @param {integer} [subjectToMinimumChargeCreditValue] Total value of minimum charge credit transactions in the
   *  invoice.
   * @param {integer} [subjectToMinimumChargeDebitValue] Total value of minimum charge debit transactions in the
   *  invoice.
   *
   * @returns {module:InvoiceModel} The newly created instance of `InvoiceModel`.
   */
  static addInvoice (
    billRunId,
    customerReference,
    financialYear,
    creditLineCount = 0,
    creditLineValue = 0,
    debitLineCount = 0,
    debitLineValue = 0,
    zeroLineCount = 0,
    subjectToMinimumChargeCount = 0,
    subjectToMinimumChargeCreditValue = 0,
    subjectToMinimumChargeDebitValue = 0
  ) {
    return InvoiceModel.query()
      .insert({
        billRunId,
        customerReference,
        financialYear,
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
}

module.exports = InvoiceHelper
