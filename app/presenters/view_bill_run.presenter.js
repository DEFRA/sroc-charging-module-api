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
    // TODO: Check about approvedForBilling, preSroc, transactionFileReference

    // Return a combination of _billRun (the 'main' bill run info) and _generated (the invoice-level stats)
    // _generated will only return the required stats if the bill run stats is 'generated'
    return {
      billRun: {
        ...this._billRun(data),
        ...this._generated(data)
      }
    }
  }

  _billRun (data) {
    return {
      id: data.id,
      billRunNumber: data.billRunNumber,
      region: data.region,
      status: data.status,
      approvedForBilling: '???',
      preSroc: '???',
      creditLineCount: data.creditCount,
      creditLineValue: data.creditValue,
      debitLineCount: data.debitCount,
      debitLineValue: data.debitValue,
      zeroValueLineCount: data.zeroCount,
      netTotal: data.netTotal,
      transactionFileReference: '???',
      invoices: data.invoices
    }
  }

  _generated (data) {
    // If the bill run status is 'generated' then we return invoice-level stats to add to the bill run view
    return data.status === 'generated'
      ? {
        creditNoteCount: data.creditNoteCount,
        creditNoteValue: data.creditNoteValue,
        invoiceCount: data.invoiceCount,
        invoiceValue: data.invoiceValue
      }
      : ''
  }
}

module.exports = ViewBillRunPresenter
