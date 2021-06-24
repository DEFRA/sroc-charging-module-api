/**
 * @module ViewInvoicePresenter
 */

const BasePresenter = require('./base.presenter')
const ViewLicencePresenter = require('./view_licence.presenter')

/**
 * Handles formatting the data into the response we send to clients after a request to view an invoice
 */
class ViewInvoicePresenter extends BasePresenter {
  _presentation (data) {
    return {
      invoice: {
        id: data.id,
        billRunId: data.billRunId,
        customerReference: data.customerReference,
        financialYear: data.financialYear,
        deminimisInvoice: data.deminimisInvoice,
        zeroValueInvoice: data.zeroValueInvoice,
        minimumChargeInvoice: data.minimumChargeInvoice,
        transactionReference: data.transactionReference,
        creditLineValue: data.creditLineValue,
        debitLineValue: data.debitLineValue,
        netTotal: data.netTotal,
        rebilledType: data.rebilledType,
        rebilledInvoiceId: data.rebilledInvoiceId,
        licences: data.licences.map(licence => {
          const presenter = new ViewLicencePresenter(licence)
          return presenter.go()
        })
      }
    }
  }
}

module.exports = ViewInvoicePresenter
