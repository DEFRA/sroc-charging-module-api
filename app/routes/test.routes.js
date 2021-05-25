'use strict'

const {
  TestBillRunsController,
  TestCustomerFilesController,
  TestTransactionsController
} = require('../controllers')

const routes = [
  {
    method: 'POST',
    path: '/admin/test/{regimeId}/bill-runs',
    handler: TestBillRunsController.create
  },
  {
    method: 'GET',
    path: '/admin/test/transactions/{id}',
    handler: TestTransactionsController.show
  },
  {
    method: 'GET',
    path: '/admin/test/{regimeId}/customer-files',
    handler: TestCustomerFilesController.index
  },
  {
    method: 'GET',
    path: '/admin/test/customer-files/{id}',
    handler: TestCustomerFilesController.show
  }
]

module.exports = routes
