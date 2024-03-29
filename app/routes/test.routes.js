'use strict'

const TestBillRunsController = require('../controllers/admin/test/test_bill_runs.controller.js')
const TestCustomerFilesController = require('../controllers/admin/test/test_customer_files.controller.js')
const TestDataExportController = require('../controllers/admin/test/test_data_export.controller.js')
const TestTransactionsController = require('../controllers/admin/test/test_transactions.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/admin/test/{regimeSlug}/bill-runs',
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
    handler: TestTransactionsController.view,
    options: {
      description: "Used by the delivery team to check all a transaction's data.",
      auth: {
        scope: ['admin']
      }
    }
  },
  {
    method: 'GET',
    path: '/admin/test/{regimeSlug}/customer-files',
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
    handler: TestCustomerFilesController.view,
    options: {
      description: 'Used by the delivery team to view a customer file and its exported customers.',
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
