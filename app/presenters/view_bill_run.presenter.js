'use strict'

/**
 * @module ViewBillRunPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Formats the data into the response we send after a view bill run request
 */
class ViewBillRunPresenter extends BasePresenter {
  _presentation (data) {
    return {
      billRun: {
        id: data.id,
        billRunNumber: data.billRunNumber,
        region: data.region,
        status: data.status,
        approvedForBilling: false,
        creditNoteCount: data.creditNoteCount,
        creditNoteValue: data.creditNoteValue,
        invoiceCount: data.invoiceCount,
        invoiceValue: data.invoiceValue,
        creditLineCount: data.creditLineCount,
        creditLineValue: data.creditLineValue,
        debitLineCount: data.debitLineCount,
        debitLineValue: data.debitLineValue,
        zeroLineCount: data.zeroLineCount,
        netTotal: data.netTotal,
        transactionFileReference: '',
        invoices: data.invoices
      }
    }
  }
}

module.exports = ViewBillRunPresenter
