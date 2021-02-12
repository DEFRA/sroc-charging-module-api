'use strict'

const {
  TestBillRunController
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
  }
]

module.exports = routes
