'use strict'

/**
 * @module ViewInvoicePresrocService
 */

const ViewInvoiceCommonService = require('../view_invoice_common.service')
const { ViewInvoicePresenter } = require('../../../presenters')

class ViewInvoicePresrocService extends ViewInvoiceCommonService {
  static _response (invoice) {
    const presenter = new ViewInvoicePresenter(invoice)
    const response = presenter.go()

    return { ...response, sroc: 'This is not sroc' }
  }
}

module.exports = ViewInvoicePresrocService
