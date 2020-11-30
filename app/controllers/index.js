'use strict'

const RootController = require('./root.controller')

const RegimesController = require('./admin/regimes.controller')
const AirbrakeController = require('./admin/health/airbrake.controller')

const BaseCalculateChargeController = require('./base_calculate_charge.controller')

const NotSupportedController = require('./not_supported.controller')

const PresrocBillRunsController = require('./presroc/bill_runs.controller')
const PresrocTransactionsController = require('./presroc/transactions.controller')
const PresrocCalculateChargeController = require('./presroc/calculate_charge.controller')

const SrocCalculateChargeController = require('./sroc/calculate_charge.controller')

module.exports = {
  RootController,
  RegimesController,
  AirbrakeController,
  BaseCalculateChargeController,
  PresrocBillRunsController,
  PresrocTransactionsController,
  PresrocCalculateChargeController,
  NotSupportedController,
  SrocCalculateChargeController
}
