'use strict'

const {
  TestBillRunsController,
  TestCustomerFilesController,
  TestDataExportController,
  TestTransactionsController
} = require('../controllers')

const routes = [
  {
    method: 'POST',
    path: '/admin/test/{regimeId}/bill-runs',
    handler: TestBillRunsController.create,
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
  },
  {
    method: 'GET',
    path: '/admin/test/{regimeId}/customer-files',
    handler: TestCustomerFilesController.index,
    options: {
      description: 'Used by the delivery team to list all customer files for a regime.',
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'GET',
    path: '/admin/test/customer-files/{id}',
    handler: TestCustomerFilesController.show,
    options: {
      description: 'Used by the delivery team to show a customer file and its exported customers.',
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'PATCH',
    path: '/admin/test/data-export',
    handler: TestDataExportController.export,
    options: {
      description: 'Used by the delivery team to generate and send export files for testing.',
      auth: {
        scope: ['admin']
      }
    }
  }
]

module.exports = routes
