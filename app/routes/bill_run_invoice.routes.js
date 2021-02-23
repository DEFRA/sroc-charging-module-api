'use strict'

const { PresrocBillRunsInvoicesController } = require('../controllers')

const routes = [
  {
    method: 'DELETE',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/invoices/{invoiceId}',
    handler: PresrocBillRunsInvoicesController.delete
  }
]

module.exports = routes
