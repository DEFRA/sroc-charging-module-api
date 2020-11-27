'use strict'

const RootController = require('./root.controller')

const RegimesController = require('./admin/regimes.controller')
const AuthorisedSystemsController = require('./admin/authorised_systems.controller')
const AirbrakeController = require('./admin/health/airbrake.controller')
const DatabaseController = require('./admin/health/database.controller')

const BaseBillRunsController = require('./base_bill_runs.controller')
const BaseTransactionsController = require('./base_transactions.controller')
const BaseCalculateChargeController = require('./base_calculate_charge.controller')

const PresrocBillRunsController = require('./presroc/bill_runs.controller')
const PresrocTransactionsController = require('./presroc/transactions.controller')
const PresrocCalculateChargeController = require('./presroc/calculate_charge.controller')

const SrocTransactionsController = require('./sroc/transactions.controller')
const SrocCalculateChargeController = require('./sroc/calculate_charge.controller')

module.exports = {
  RootController,
  RegimesController,
  AirbrakeController,
  AuthorisedSystemsController,
  BaseBillRunsController,
  BaseTransactionsController,
  BaseCalculateChargeController,
  DatabaseController,
  PresrocBillRunsController,
  PresrocTransactionsController,
  PresrocCalculateChargeController,
  SrocTransactionsController,
  SrocCalculateChargeController
}
