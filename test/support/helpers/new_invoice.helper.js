'use strict'

const { InvoiceModel } = require('../../../app/models')

const NewBillRunHelper = require('./new_bill_run.helper')

class NewInvoiceHelper {
  /**
   * Create an invoice
   *
   * @param {module:BillRunModel} [billRun] Bill run the invoice is to be created on. If not specified then a new bill
   *  run will be created.
   * @param {object} [overrides] JSON object of values which will override the ones the helper defaults to.
   *
   * @returns {module:InvoiceModel} The newly created instance of `InvoiceModel`.
   */
  static async add (billRun, overrides = {}) {
    if (!billRun) {
      billRun = await NewBillRunHelper.add()
    }

    const invoiceValues = {
      ...this._defaultInvoice(),
      ...overrides
    }
    const flags = this._flags(invoiceValues)

    const invoice = await InvoiceModel.query()
      .insert({
        billRunId: billRun.id,
        ...invoiceValues,
        ...flags
      })
      .returning('*')

    const updatePatch = this._updatePatch(invoice)
    await NewBillRunHelper.update(billRun, updatePatch)

    return invoice
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

  static _updatePatch (invoice) {
    return {
      creditLineCount: invoice.creditLineCount,
      creditLineValue: invoice.creditLineValue,
      debitLineCount: invoice.debitLineCount,
      debitLineValue: invoice.debitLineValue,
      zeroLineCount: invoice.zeroLineCount,
      subjectToMinimumChargeCount: invoice.subjectToMinimumChargeCount,
      subjectToMinimumChargeCreditValue: invoice.subjectToMinimumChargeCreditValue,
      subjectToMinimumChargeDebitValue: invoice.subjectToMinimumChargeDebitValue
    }
  }

  /**
   * Updates an invoice
   *
   * @param {module:InvoiceModel} invoice The invoice to be updated.
   * @param {object} updates JSON object of values to be updated. Each value in the object will be added to the existing
   *  value in the invoice if it is a number; if it isn't a number then the existing value will be replaced.
   *
   * @returns {module:InvoiceModel} The newly updated instance of `InvoiceModel`.
   */
  static async update (invoice, updates = {}) {
    const patch = {}

    for (const key in updates) {
      // If the value is a number then we add it to the existing number; otherwise we replace the existing value
      if (typeof updates[key] === 'number') {
        patch[key] = invoice[key] + updates[key]
      } else {
        patch[key] = updates[key]
      }
    }

    return invoice.$query()
      .patchAndFetch(patch)
  }
}

module.exports = NewInvoiceHelper
