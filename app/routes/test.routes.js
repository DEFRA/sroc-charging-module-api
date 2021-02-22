'use strict'

const {
  TestBillRunController,
  TestTransactionsController
} = require('../controllers')

const routes = [
  {
    method: 'POST',
    path: '/admin/test/{regimeId}/bill-runs/generate',
    handler: TestBillRunController.generate,
    options: {
      description: 'Used by the delivery team to automatically generate bill runs for testing.',
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'GET',
    path: '/admin/test/transactions/{id}',
    handler: TestTransactionsController.show,
    options: {
      description: "Used by the delivery team to check all a transaction's data.",
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
