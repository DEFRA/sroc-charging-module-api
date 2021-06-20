'use strict'

/**
 * @module InvoiceRebillingInitialiseService
 */

const { InvoiceModel } = require('../models')

class InvoiceRebillingInitialiseService {
  /**
   * Creates two empty invoices on a given bill run for rebilling purposes: a 'cancel' invoice and a 'rebill' invoice
   *
   * The cancel invoice is the invoice which will cancel out the invoice being rebilled, and the rebill invoice is the
   * one that will rebill the the customer. They can be identifed by rebillType `C` and `R` respectively. Both invoices
   * will be linked to the original invoice by rebilledInvoiceId, which contains the id of the original invoice.
   *
   * @param {module:BillRunModel} billRun An instance of `BillRunModel` of the bill run to add the invoices to.
   * @param {module:InvoiceModel} invoice An instance of `InvoiceModel` of the invoice to be rebilled.
   *
   * @returns {Object} An `object` containing `cancelInvoice` and `rebillInvoice`.
   * @returns {module:InvoiceModel} `object.cancelInvoice` The cancel invoice.
   * @returns {module:InvoiceModel} `object.rebillInvoice` The rebill invoice.
   */
  static async go (billRun, invoice) {
    let cancelInvoice
    let rebillInvoice

    await InvoiceModel.transaction(async trx => {
      cancelInvoice = await this._createInvoice(billRun, invoice, 'C', trx)
      rebillInvoice = await this._createInvoice(billRun, invoice, 'R', trx)
    })

    return {
      cancelInvoice,
      rebillInvoice
    }
  }

  static _createInvoice (billRun, invoice, rebilledType, trx) {
    return InvoiceModel.query(trx).insert({
      billRunId: billRun.id,
      customerReference: invoice.customerReference,
      financialYear: invoice.financialYear,
      rebilledInvoiceId: invoice.id,
      deminimisInvoice: invoice.deminimisInvoice,
      minimumChargeInvoice: invoice.minimumChargeInvoice,
      rebilledType
    })
  }
}

module.exports = InvoiceRebillingInitialiseService
