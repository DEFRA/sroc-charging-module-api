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
      description: 'Feature not yet complete.',
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
