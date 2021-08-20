'use strict'

const RootController = require('./root.controller')

const AdminBillRunsController = require('./admin/bill_runs.controller')
const AirbrakeController = require('./admin/health/airbrake.controller')
const AuthorisedSystemsController = require('./admin/authorised_systems.controller')
const CustomersController = require('./admin/customers.controller')
const DatabaseController = require('./admin/health/database.controller')
const NotSupportedController = require('./not_supported.controller')
const PresrocBillRunsController = require('./bill_runs.controller')
const PresrocBillRunsInvoicesController = require('./bill_runs_invoices.controller')
const PresrocBillRunsLicencesController = require('./bill_runs_licences.controller')
const PresrocBillRunsTransactionsController = require('./bill_runs_transactions.controller')
const PresrocCalculateChargeController = require('./calculate_charge.controller')
const PresrocCustomerDetailsController = require('./customer_details.controller')
const RegimesController = require('./admin/regimes.controller')
const TestBillRunsController = require('./admin/test/test_bill_runs.controller')
const TestCustomerFilesController = require('./admin/test/test_customer_files.controller')
const TestDataExportController = require('./admin/test/test_data_export.controller')
const TestTransactionsController = require('./admin/test/test_transactions.controller')

module.exports = {
  AdminBillRunsController,
  AirbrakeController,
  AuthorisedSystemsController,
  CustomersController,
  DatabaseController,
  NotSupportedController,
  PresrocBillRunsController,
  PresrocBillRunsInvoicesController,
  PresrocBillRunsLicencesController,
  PresrocBillRunsTransactionsController,
  PresrocCalculateChargeController,
  PresrocCustomerDetailsController,
  RegimesController,
  RootController,
  TestBillRunsController,
  TestCustomerFilesController,
  TestDataExportController,
  TestTransactionsController
}
