'use strict'

/**
 * @module FetchAndValidateInvoiceService
 */

const Boom = require('@hapi/boom')

const InvoiceModel = require('../../models/invoice.model.js')

class FetchAndValidateInvoiceService {
  /**
  * Fetches then validates that an invoice exists and is linked to the specified bill run
  *
  * Intended for use in the `view` and `delete` invoice endpoints
  *
  * @param {string} billRunId Id of the bill run the invoice should link to
  * @param {string} invoiceId Id of the invoice to find and validate
  *
  * @returns {@module:InvoiceModel} an instance of `InvoiceModel` for the matching invoice, else a `404` error if not
  * found and a `401` if not linked to the bill run.
  */
  static async go (billRunId, invoiceId) {
    const invoice = await this._invoice(invoiceId)

    // Simply call the validation method. It will throw an error if any issue is found
    this._validate(billRunId, invoiceId, invoice)

    return invoice
  }

  static _invoice (invoiceId) {
    return InvoiceModel.query().findById(invoiceId)
  }

  static _validate (billRunId, invoiceId, invoice) {
    if (!invoice) {
      throw Boom.notFound(`Invoice ${invoiceId} is unknown.`)
    }
    if (invoice.billRunId !== billRunId) {
      throw Boom.conflict(`Invoice ${invoiceId} is not linked to bill run ${billRunId}.`)
    }
  }
}

module.exports = FetchAndValidateInvoiceService
