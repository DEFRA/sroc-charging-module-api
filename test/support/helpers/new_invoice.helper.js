'use strict'

const BillRunModel = require('../../../app/models/bill_run.model')
const InvoiceModel = require('../../../app/models/invoice.model')

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
  static async create (billRun, overrides = {}) {
    if (!billRun) {
      billRun = await NewBillRunHelper.create()
    } else {
      // Refresh the bill run we've been passed to ensure any previous changes aren't overwritten
      billRun = await billRun.$query()
    }

    const invoiceValues = {
      ...this._defaultInvoice(),
      ...overrides
    }

    const invoice = await InvoiceModel.query()
      .insert({
        billRunId: billRun.id,
        ...invoiceValues
      })
      .returning('*')

    await this._updateBillRun(billRun, invoice)

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

  static async _updateBillRun (billRun, objectToUpdateFrom) {
    const updatePatch = this._updatePatch(objectToUpdateFrom)
    await NewBillRunHelper.update(billRun, updatePatch)
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
   *  value in the bill run if it is a number (unless it's an exception such as financialYear); if it isn't a number
   *  then the existing value will be replaced.
   *
   * @returns {module:InvoiceModel} The newly updated instance of `InvoiceModel`.
   */
  static async update (invoice, updates = {}) {
    const patch = {}

    for (const [key, value] of Object.entries(updates)) {
      // If the field is "addable" then we add it to the existing number; otherwise we replace the existing value.
      if (this._addable(key, value)) {
        patch[key] = invoice[key] + value
      } else {
        patch[key] = value
      }
    }

    const updatedInvoice = await invoice.$query()
      .patchAndFetch(patch)

    const billRun = await BillRunModel.query().findById(invoice.billRunId)
    await this._updateBillRun(billRun, updates)

    return updatedInvoice
  }

  /**
   * When updating an entity we either add or replace values. In general, we add anything that's a number (eg. counts
   * and values) and replace anything that isn't. However some numbers are an exception and we do want them to be
   * replaced. This function returns true if the passed key/value pair are suitable for adding and false if they aren't.
   */
  static _addable (key, value) {
    const isNumber = typeof value === 'number'
    const exception = ['billRunNumber', 'financialYear'].includes(key)
    return isNumber && !exception
  }

  /**
   * Refreshes the zeroValueInvoice and deminimisInvoice flags on an invoice, based on its current counts and values.
   *
   * @param {module:InvoiceModel} invoice The invoice with flags to be refreshed.
   *
   * @returns {module:InvoiceModel} The newly updated instance of `InvoiceModel`.
   */
  static async refreshFlags (invoice) {
    const {
      creditLineCount,
      creditLineValue,
      debitLineCount,
      debitLineValue,
      zeroLineCount,
      subjectToMinimumChargeCreditValue,
      subjectToMinimumChargeDebitValue
    } = invoice

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

    return invoice.$query()
      .patchAndFetch(flags)
  }
}

module.exports = NewInvoiceHelper
