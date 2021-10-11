'use strict'

const { BillRunsInvoicesController } = require('../controllers')

const routes = [
  {
    method: 'DELETE',
    path: '/v2/{regimeSlug}/bill-runs/{billRunId}/invoices/{invoiceId}',
    handler: BillRunsInvoicesController.delete
  },
  {
    method: 'GET',
    path: '/v2/{regimeSlug}/bill-runs/{billRunId}/invoices/{invoiceId}',
    handler: BillRunsInvoicesController.view
  },
  {
    method: 'PATCH',
    path: '/v2/{regimeSlug}/bill-runs/{billRunId}/invoices/{invoiceId}/rebill',
    handler: BillRunsInvoicesController.rebill
  }
]

module.exports = routes
