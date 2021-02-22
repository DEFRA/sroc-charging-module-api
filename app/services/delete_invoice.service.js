'use strict'

/**
 * @module DeleteInvoiceService
 */

const Boom = require('@hapi/boom')

const { BillRunModel, InvoiceModel } = require('../models')
const { raw } = require('../models/base.model')

class DeleteInvoiceService {
  /**
   * Deletes an invoice and its transactions, and updates the figures of the bill run that the invoice belongs to.
   *
   * @param {string} invoiceId The id of the invoice to be deleted.
   */
  static async go (invoiceId) {
    const invoice = await this._invoice(invoiceId)

    const billRunPatch = this._billRunPatch(invoice)

    await InvoiceModel.transaction(async trx => {
      // TODO: Delete transactions as well -- cascade or similar
      await InvoiceModel
        .query()
        .deleteById(invoiceId)

      await BillRunModel
        .query(trx)
        .findById(invoice.billRunId)
        .patch(billRunPatch)
    })
  }

  static async _invoice (invoiceId) {
    const invoice = await InvoiceModel.query().findById(invoiceId)

    if (invoice) {
      return invoice
    }

    throw Boom.notFound(`Invoice ${invoiceId} is unknown.`)
  }

  /**
   * Create an update patch to be applied to a bill run which subtracts the counts and values of the passed-in invoice.
   *
   * @param {module:InvoiceModel} invoice The invoice which is to have its values subtracted from a bill run.
   */
  static _billRunPatch (invoice) {
    // TODO: Confirm behaviour of creditNoteCount/Value and invoiceCount/Value
    const update = {
      creditLineCount: raw('credit_line_count - ?', invoice.creditLineCount),
      creditLineValue: raw('credit_line_value - ?', invoice.creditLineValue),
      debitLineCount: raw('debit_line_count - ?', invoice.debitLineCount),
      debitLineValue: raw('debit_line_value - ?', invoice.debitLineValue),
      zeroLineCount: raw('zero_line_count - ?', invoice.zeroLineCount),
      subjectToMinimumChargeCount: raw('subject_to_minimum_charge_count - ?', invoice.subjectToMinimumChargeCount),
      subjectToMinimumChargeCreditValue: raw('subject_to_minimum_charge_credit_value - ?', invoice.subjectToMinimumChargeCreditValue),
      subjectToMinimumChargeDebitValue: raw('subject_to_minimum_charge_debit_value - ?', invoice.subjectToMinimumChargeDebitValue)
    }

    return update
  }
}

module.exports = DeleteInvoiceService
