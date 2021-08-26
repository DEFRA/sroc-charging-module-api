'use strict'

/**
 * @module ViewInvoiceService
 */

const ViewInvoicePresrocService = require('./presroc/view_invoice_presroc.service')

class ViewInvoiceService {
  /**
   * Locates and validates an invoice for the specificed bill run and returns the data needed by the View Invoice
   * endpoint
   *
   * @param {string} billRunId The id of the bill run the invoice is linked to
   * @param {string} invoiceId The id of the invoice we are trying to view
   *
   * @returns {Object} The requested invoice data
   */
  static async go (billRunId, invoiceId) {
    return ViewInvoicePresrocService.go(billRunId, invoiceId)
  }
}

module.exports = ViewInvoiceService
