'use strict'

/**
 * @module InvoiceRebillingValidationService
 */

const Boom = require('@hapi/boom')

const { BillRunModel, InvoiceModel } = require('../../models')

class InvoiceRebillingValidationService {
/**
  * Validates that an invoice exists and that it is suitable for rebilling:
  * - The invoice does not already belong to the bill run it is being rebilled to;
  * - The invoice is not already subject to a rebilling request;
  * - The status of its current bill run is 'billed';
  * - The region of the bill run it is being rebilled to matches the region of its current bill run;
  * - It is not a rebill cancel invoice.
  *
  * Note that we do not validate the status of the bill run we will rebill to as this will have already been handled by
  * our bill run plugin (since we pass the new bill run in the url).
  *
  * @param {module:BillRunModel} newBillRun An instance of `BillRunModel` for the bill run we will rebill to
  * @param {string} invoice Id of the invoice to find and validate
  * @returns {Boolean} Returns `true` if the invoice passes validation. If it fails then a `409` error will have been
  * thrown.
  */
  static async go (newBillRun, invoice) {
    const currentBillRun = await this._currentBillRun(invoice)

    this._validateNotOnNewBillRun(currentBillRun, newBillRun, invoice.id)
    await this._validateNotCurrentlyRebilled(invoice.id)
    this._validateCurrentBillRunStatus(currentBillRun)
    this._validateRegion(currentBillRun, newBillRun, invoice.id)
    this._validateRuleset(currentBillRun, newBillRun, invoice.id)
    this._validateNotCancelInvoice(invoice)

    return true
  }

  static async _currentBillRun (invoice) {
    return BillRunModel.query().findById(invoice.billRunId)
  }

  static _validateNotOnNewBillRun (currentBillRun, newBillRun, invoiceId) {
    if (currentBillRun.id === newBillRun.id) {
      throw Boom.conflict(`Invoice ${invoiceId} is already on bill run ${newBillRun.id}.`)
    }
  }

  static async _validateNotCurrentlyRebilled (invoiceId) {
    const rebillInvoiceIds = await InvoiceModel.query()
      .select('id')
      .where('rebilledInvoiceId', invoiceId)

    if (rebillInvoiceIds.length) {
      throw Boom.conflict(`Invoice ${invoiceId} has already been rebilled.`)
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

  static _validateRuleset (currentBillRun, newBillRun, invoiceId) {
    if (currentBillRun.ruleset !== newBillRun.ruleset) {
      throw Boom.conflict(
          `Invoice ${invoiceId} is for ruleset ${currentBillRun.ruleset} but bill run ${newBillRun.id} is for ruleset ${newBillRun.ruleset}.`
      )
    }
  }

  static _validateNotCancelInvoice (invoice) {
    if (invoice.rebilledType === 'C') {
      throw Boom.conflict(
          `Invoice ${invoice.id} is a rebill cancel invoice and cannot be rebilled.`
      )
    }
  }
}

module.exports = InvoiceRebillingValidationService
