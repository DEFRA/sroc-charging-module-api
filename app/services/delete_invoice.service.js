'use strict'

/**
 * @module DeleteInvoiceService
 */

const Boom = require('@hapi/boom')

const { InvoiceModel } = require('../models')
const InvoiceService = require('./invoice.service')

class DeleteInvoiceService {
  static async go (invoiceId) {
    // Validate that the invoice exists
    const invoice = await this._invoice(invoiceId)

    // TODO: Get billrun values

    // Within a single db transaction:
    // * Delete the invoice
    // * TODO: Tell the db to update the fields based on the billrun values

    await InvoiceModel.query().deleteById(invoiceId)

    return true
  }

  static async _invoice (invoiceId) {
    const invoice = await InvoiceModel.query().findById(invoiceId)

    if (invoice) {
      return invoice
    }

    throw Boom.notFound(`Invoice ${invoiceId} is unknown.`)
  }
}

module.exports = DeleteInvoiceService
