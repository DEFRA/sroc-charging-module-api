'use strict'

/**
 * @module ViewInvoicePresenter
 */

const BasePresenter = require('./base.presenter.js')
const ViewLicencePresenter = require('./view_licence.presenter.js')

/**
 * Handles formatting the data into the response we send to clients after a request to view an invoice. Note that we
 * expect billRun.ruleset to be passed in on top of the regular invoice data.
 */
class ViewInvoicePresenter extends BasePresenter {
  _presentation (data) {
    return {
      invoice: {
        id: data.id,
        billRunId: data.billRunId,
        ruleset: data.billRun.ruleset,
        customerReference: data.customerReference,
        financialYear: data.financialYear,
        deminimisInvoice: data.deminimisInvoice,
        zeroValueInvoice: data.zeroValueInvoice,
        // We only include minimumChargeInvoice if the ruleset is `presroc`
        ...(data.billRun.ruleset === 'presroc') && { minimumChargeInvoice: data.minimumChargeInvoice },
        transactionReference: data.transactionReference,
        creditLineValue: data.creditLineValue,
        debitLineValue: data.debitLineValue,
        netTotal: data.netTotal,
        rebilledType: data.rebilledType,
        rebilledInvoiceId: data.rebilledInvoiceId,
        licences: data.licences.map(licence => {
          const presenter = new ViewLicencePresenter({ ...licence, ruleset: data.billRun.ruleset })
          return presenter.go()
        })
      }
    }
  }
}

module.exports = ViewInvoicePresenter
