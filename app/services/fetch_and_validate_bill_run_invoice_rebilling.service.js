'use strict'

/**
 * @module FetchAndValidateBillRunInvoiceRebillingService
 */

const Boom = require('@hapi/boom')

const { BillRunModel, InvoiceModel } = require('../models')

class FetchAndValidateBillRunInvoiceRebillingService {
  /**
  * Fetches then validates that an invoice exists and that it is suitable for rebilling:
  * - The invoice does not already belong to the bill run it is being rebilled to;
  * - The status of its current bill run is 'billed';
  * - The bill run it is being rebilled to has an "editable" status;
  * - The region of the bill run it is being rebilled to matches the region of its current bill run.
  *
  * @param {module:BillRunModel} newBillRun An instance of `BillRunModel` for the bill run we will rebill to
  * @param {string} invoiceId Id of the invoice to find and validate
  * @returns {@module:InvoiceModel} an instance of `InvoiceModel` for the matching invoice, else a `404` error if not
  * found or a `409` error if the request is conflicting (eg. incorrect status or invalid destination bill run)
  */
  static async go (newBillRun, invoiceId) {
    const invoice = await this._invoice(invoiceId)
    this._validateInvoiceExists(invoiceId, invoice)

    const currentBillRun = await this._currentBillRun(invoice)

    this._validateNotOnNewBillRun(currentBillRun, newBillRun, invoice.id)
    this._validateCurrentBillRunStatus(currentBillRun)
    this._validateRegion(currentBillRun, newBillRun, invoice.id)

    return invoice
  }

  static async _invoice (invoiceId) {
    return InvoiceModel.query().findById(invoiceId)
  }

  static _validateInvoiceExists (invoiceId, invoice) {
    if (!invoice) {
      throw Boom.notFound(`Invoice ${invoiceId} is unknown.`)
    }
  }

  static async _currentBillRun (invoice) {
    return await BillRunModel.query().findById(invoice.billRunId)
  }

  static _validateNotOnNewBillRun (currentBillRun, newBillRun, invoiceId) {
    if (currentBillRun.id === newBillRun.id) {
      throw Boom.conflict(
          `Invoice ${invoiceId} is already on bill run ${newBillRun.id}.`
      )
    }
  }

  static _validateCurrentBillRunStatus (billRun) {
    if (!billRun.$billed()) {
      throw Boom.conflict(`Bill run ${billRun.id} does not have a status of 'billed'.`)
    }
  }

  static _validateRegion (currentBillRun, newBillRun, invoiceId) {
    if (currentBillRun.region !== newBillRun.region) {
      throw Boom.conflict(
          `Invoice ${invoiceId} is for region ${currentBillRun.region} but bill run ${newBillRun.id} is for region ${newBillRun.region}.`
      )
    }
  }
}

module.exports = FetchAndValidateBillRunInvoiceRebillingService
