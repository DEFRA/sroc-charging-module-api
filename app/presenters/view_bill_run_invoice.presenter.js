'use strict'

/**
 * @module ViewInvoicePresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Handles formatting the data into the response we send to clients after a request to view an a bill run. This handles
 * how the invoices in the bill run are presented.
 */
class ViewBillRunInvoicePresenter extends BasePresenter {
  _presentation (data) {
    return {
      id: data.id,
      customerReference: data.customerReference,
      financialYear: data.financialYear,
      deminimisInvoice: data.deminimisInvoice,
      zeroValueInvoice: data.zeroValueInvoice,
      minimumChargeInvoice: data.minimumChargeInvoice,
      transactionReference: data.transactionReference,
      netTotal: data.netTotal,
      licences: data.licences
    }
  }
}

module.exports = ViewBillRunInvoicePresenter
