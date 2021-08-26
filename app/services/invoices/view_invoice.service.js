'use strict'

/**
 * @module ViewInvoiceService
 */

const ViewInvoicePresrocService = require('./presroc/view_invoice_presroc.service')
const ViewInvoiceSrocService = require('./sroc/view_invoice_sroc.service')

class ViewInvoiceService {
  /**
   * Locates and validates an invoice for the specificed bill run and returns the data needed by the View Invoice
   * endpoint
   *
   * @param {string} billRunId The id of the bill run the invoice is linked to
   * @param {string} invoiceId The id of the invoice we are trying to view
   * @param {string} ruleset The ruleset of the parent bill run
   *
   * @returns {Object} The requested invoice data
   */
  static async go (billRunId, invoiceId, ruleset) {
    switch (ruleset) {
      case 'sroc':
        return ViewInvoiceSrocService.go(billRunId, invoiceId)
      case 'presroc':
        return ViewInvoicePresrocService.go(billRunId, invoiceId)
      default:
        throw Error('Unrecognised ruleset')
    }
  }
}

module.exports = ViewInvoiceService
