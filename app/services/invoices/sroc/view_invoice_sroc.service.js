'use strict'

/**
 * @module ViewInvoiceSrocService
 */

const ViewInvoiceCommonService = require('../view_invoice_common.service')
const { ViewInvoicePresenter } = require('../../../presenters')

class ViewInvoiceSrocService extends ViewInvoiceCommonService {
  static _response (invoice) {
    const presenter = new ViewInvoicePresenter(invoice)
    const response = presenter.go()

    return { ...response, sroc: 'This is sroc' }
  }
}

module.exports = ViewInvoiceSrocService
