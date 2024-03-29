'use strict'

/**
 * @module ViewBillRunInvoicePresenter
 */

const BasePresenter = require('./base.presenter.js')

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
      // We only include minimumChargeInvoice if the ruleset is `presroc`
      ...(data.ruleset === 'presroc') && { minimumChargeInvoice: data.minimumChargeInvoice },
      transactionReference: data.transactionReference,
      creditLineValue: data.creditLineValue,
      debitLineValue: data.debitLineValue,
      netTotal: data.netTotal,
      rebilledType: data.rebilledType,
      rebilledInvoiceId: data.rebilledInvoiceId,
      licences: data.licences
    }
  }
}

module.exports = ViewBillRunInvoicePresenter
