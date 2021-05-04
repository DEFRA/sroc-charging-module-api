'use strict'

/**
 * @module InvoiceRebillingInitialiseService
 */

const { InvoiceModel } = require('../models')
const { RebillingInvoicesPresenter } = require('../presenters')

class InvoiceRebillingInitialiseService {
  /**
   * Creates two empty invoices on a given bill run for rebilling purposes: a 'cancel' invoice and a 'rebill' invoice.
   * The cancel invoice is the invoice which will cancel out the invoice being rebilled, and the rebill invoice is the
   * one that will rebill the the customer. They can be identifed by rebillType `C` and `R` respectively. Both invoices
   * will be linked to the original invoice by rebilledInvoiceId, which contains the id of the original invoice.
   *
   * @param {module:BillRunModel} billRun An instance of `BillRunModel` of the bill run to add the invoices to.
   * @param {module:InvoiceModel} invoice An instance of `InvoiceModel` of the invoice to be rebilled.
   *
   * @returns {Object} A reponse object containing `cancelInvoice`, `rebillInvoice` and `response`.
   * @returns {module:InvoiceModel} `resonse.cancelInvoice` The cancel invoice.
   * @returns {module:InvoiceModel} `response.rebillInvoice` The rebill invoice.
   * @returns {Array} `response.response` An array containing the cancel invoice id and type `C`, and the rebill invoice
   * id and type `R`.
   */
  static async go (billRun, invoice) {
    const cancelInvoice = await this._createInvoice(billRun, invoice, 'C')
    const rebillInvoice = await this._createInvoice(billRun, invoice, 'R')

    const response = this._response(cancelInvoice, rebillInvoice)

    return {
      cancelInvoice,
      rebillInvoice,
      response
    }
  }

  static _response (cancelInvoice, rebillInvoice) {
    const presenter = new RebillingInvoicesPresenter([cancelInvoice, rebillInvoice])

    return presenter.go()
  }

  static _createInvoice (billRun, invoice, rebilledType) {
    return InvoiceModel.query().insert({
      billRunId: billRun.id,
      customerReference: invoice.customerReference,
      financialYear: invoice.financialYear,
      rebilledInvoiceId: invoice.id,
      rebilledType
    })
  }
}

module.exports = InvoiceRebillingInitialiseService
