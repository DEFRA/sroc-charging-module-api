'use strict'

const RootController = require('./root.controller')

const RegimesController = require('./admin/regimes.controller')
const AuthorisedSystemsController = require('./admin/authorised_systems.controller')
const AirbrakeController = require('./admin/health/airbrake.controller')
const DatabaseController = require('./admin/health/database.controller')

const BaseCalculateChargeController = require('./base_calculate_charge.controller')

const NotSupportedController = require('./not_supported.controller')

const PresrocAddBillRunTransactionController = require('./presroc/add_bill_run_transaction.controller')
const PresrocBillRunsController = require('./presroc/bill_runs.controller')
const PresrocCalculateChargeController = require('./presroc/calculate_charge.controller')
const PresrocTransactionsController = require('./presroc/transactions.controller')

module.exports = {
  RootController,
  RegimesController,
  AirbrakeController,
  AuthorisedSystemsController,
  BaseCalculateChargeController,
  DatabaseController,
  PresrocAddBillRunTransactionController,
  PresrocBillRunsController,
  PresrocCalculateChargeController,
  PresrocTransactionsController,
  NotSupportedController
}
