'use strict'

const { InvoiceModel } = require('../../../app/models')

const NewBillRunHelper = require('./new_bill_run.helper')

class NewInvoiceHelper {
  /**
   * Create an invoice
   *
   * @param {string} [billRunId] Id to use for the `bill_run_id` field. If not specified then a new bill run will be
   *  created.
   * @param {object} [overrides] JSON object of values which will override the ones the helper defaults to.
   *
   * @returns {module:InvoiceModel} The newly created instance of `InvoiceModel`.
   */
  static async addInvoice (billRunId, overrides = {}) {
    let billRun

    if (!billRunId) {
      billRun = await NewBillRunHelper.addBillRun()
      billRunId = billRun.id
    }

    const invoiceValues = {
      ...this._defaultInvoice(),
      ...overrides
    }
    const flags = this._flags(invoiceValues)

    return InvoiceModel.query()
      .insert({
        billRunId,
        ...invoiceValues,
        ...flags
      })
      .returning('*')
  }

  static _defaultInvoice () {
    // We set rebilledInvoiceId and rebilledType to `undefined` so the db's defaults are used if they're not specified
    return {
      customerReference: 'CUSTOMER_REF',
      financialYear: 2021,
      creditLineCount: 0,
      creditLineValue: 0,
      debitLineCount: 0,
      debitLineValue: 0,
      zeroLineCount: 0,
      subjectToMinimumChargeCount: 0,
      subjectToMinimumChargeCreditValue: 0,
      subjectToMinimumChargeDebitValue: 0,
      rebilledInvoiceId: undefined,
      rebilledType: undefined
    }
  }

  static _flags ({
    creditLineCount,
    creditLineValue,
    debitLineCount,
    debitLineValue,
    zeroLineCount,
    subjectToMinimumChargeCreditValue,
    subjectToMinimumChargeDebitValue
  }) {
    const flags = {
      zeroValueInvoice: false,
      deminimisInvoice: false
    }

    const nonZeroLineCount = creditLineCount + debitLineCount
    const netValue = debitLineValue - creditLineValue
    const minimumChargeNetValue = subjectToMinimumChargeCreditValue + subjectToMinimumChargeDebitValue

    if ((nonZeroLineCount === 0) && (zeroLineCount > 0)) {
      flags.zeroValueInvoice = true
    } else if ((netValue > 0) && (netValue < 500)) {
      if (minimumChargeNetValue === 0) {
        flags.deminimisInvoice = true
      }
    }

    return flags
  }
}

module.exports = NewInvoiceHelper
