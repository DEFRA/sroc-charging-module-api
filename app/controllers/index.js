'use strict'

const RootController = require('./root.controller')

const AdminBillRunsController = require('./admin/bill_runs.controller')
const AirbrakeController = require('./admin/health/airbrake.controller')
const AuthorisedSystemsController = require('./admin/authorised_systems.controller')
const CustomersController = require('./admin/customers.controller')
const DatabaseController = require('./admin/health/database.controller')
const NotSupportedController = require('./not_supported.controller')
const BillRunsController = require('./bill_runs.controller')
const BillRunsInvoicesController = require('./bill_runs_invoices.controller')
const BillRunsLicencesController = require('./bill_runs_licences.controller')
const BillRunsTransactionsController = require('./bill_runs_transactions.controller')
const CalculateChargeController = require('./calculate_charge.controller')
const CustomerDetailsController = require('./customer_details.controller')
const CustomerFilesController = require('./customer_files.controller')
const RegimesController = require('./admin/regimes.controller')
const TestBillRunsController = require('./admin/test/test_bill_runs.controller')
const TestCustomerFilesController = require('./admin/test/test_customer_files.controller')
const TestDataExportController = require('./admin/test/test_data_export.controller')
const TestTransactionsController = require('./admin/test/test_transactions.controller')

module.exports = {
  AdminBillRunsController,
  AirbrakeController,
  AuthorisedSystemsController,
  BillRunsController,
  BillRunsInvoicesController,
  BillRunsLicencesController,
  BillRunsTransactionsController,
  CalculateChargeController,
  CustomerDetailsController,
  CustomerFilesController,
  CustomersController,
  DatabaseController,
  NotSupportedController,
  RegimesController,
  RootController,
  TestBillRunsController,
  TestCustomerFilesController,
  TestDataExportController,
  TestTransactionsController
}
