'use strict'

/**
 * @module ViewBillRunPresenter
 */

const BasePresenter = require('./base.presenter')
const ViewBillRunInvoicePresenter = require('./view_bill_run_invoice.presenter')

/**
 * Formats the data into the response we send after a view bill run request.
 */
class ViewBillRunPresenter extends BasePresenter {
  _presentation (data) {
    return {
      billRun: {
        id: data.id,
        billRunNumber: data.billRunNumber,
        ruleset: data.ruleset,
        region: data.region,
        status: data.status,
        creditNoteCount: data.creditNoteCount,
        creditNoteValue: data.creditNoteValue,
        invoiceCount: data.invoiceCount,
        invoiceValue: data.invoiceValue,
        netTotal: data.netTotal,
        transactionFileReference: data.fileReference,
        invoices: data.invoices.map(invoice => {
          // We have to add ruleset to the invoice passed to the presenter as presenters can only accept one argument
          const presenter = new ViewBillRunInvoicePresenter({ ...invoice, ruleset: data.ruleset })
          return presenter.go()
        })
      }
    }
  }
}

module.exports = ViewBillRunPresenter
