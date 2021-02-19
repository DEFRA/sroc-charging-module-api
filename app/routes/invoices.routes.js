'use strict'

const { PresrocInvoicesController } = require('../controllers')

const routes = [
  {
    method: 'DELETE',
    path: '/v2/{regimeId}/invoices/{invoiceId}',
    handler: PresrocInvoicesController.delete
  }
]

module.exports = routes
