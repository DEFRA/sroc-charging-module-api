'use strict'

/**
 * @module RequestInvoiceService
 */

const Boom = require('@hapi/boom')

const InvoiceModel = require('../../models/invoice.model.js')

class RequestInvoiceService {
  /**
   * Find a invoice and determine if it's valid for the request.
   *
   * We have a number of services that
   *
   * - first need to find a matching invoice
   * - perform some initial validation
   * - perform validation specific to the service
   *
   * As the number of services grew, so to did the duplication of the first two actions across them. This service and
   * the {@module InvoicePlugin} were created to remove the duplication and simplify the project.
   *
   * It checks that the request relates to an invoice that exists. If this check fails a {@module Boom} error is thrown.
   *
   * @param {string} path The full request path. Used to determine if it's invoice related
   * @param {string} invoiceId The id of the requested invoice
   *
   * @returns {Object} If the request is invoice related and it's valid it returns an instance of
   * {@module InvoiceModel}. Else it returns `null`
   */
  static async go (path, invoiceId) {
    if (!this._invoiceRelated(path)) {
      return null
    }

    const invoice = await this._invoice(invoiceId)
    this._validateInvoice(invoice, invoiceId)

    return invoice
  }

  static _invoiceRelated (path) {
    return /\/invoices\//i.test(path)
  }

  static _invoice (invoiceId) {
    return InvoiceModel.query().findById(invoiceId)
  }

  static _validateInvoice (invoice, invoiceId) {
    if (!invoice) {
      throw Boom.notFound(`Invoice ${invoiceId} is unknown.`)
    }
  }
}

module.exports = RequestInvoiceService
