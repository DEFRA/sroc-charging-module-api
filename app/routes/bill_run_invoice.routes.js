'use strict'

const { PresrocBillRunsInvoicesController } = require('../controllers')

const routes = [
  {
    method: 'DELETE',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/invoices/{invoiceId}',
    handler: PresrocBillRunsInvoicesController.delete
  },
  {
    method: 'GET',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/invoices/{invoiceId}',
    handler: PresrocBillRunsInvoicesController.view
  },
  {
    method: 'PATCH',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/invoices/{invoiceId}/rebill',
    handler: PresrocBillRunsInvoicesController.rebill,
    options: {
      app: {
        excludeFromProd: true
      }
    }
  }
]

module.exports = routes
