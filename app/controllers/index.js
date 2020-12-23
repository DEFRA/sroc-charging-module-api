'use strict'

const RootController = require('./root.controller')

const RegimesController = require('./admin/regimes.controller')
const AuthorisedSystemsController = require('./admin/authorised_systems.controller')
const AirbrakeController = require('./admin/health/airbrake.controller')
const DatabaseController = require('./admin/health/database.controller')
const NotSupportedController = require('./not_supported.controller')
const PresrocBillRunsController = require('./presroc/bill_runs.controller')
const PresrocCalculateChargeController = require('./presroc/calculate_charge.controller')

module.exports = {
  RootController,
  RegimesController,
  AirbrakeController,
  AuthorisedSystemsController,
  DatabaseController,
  PresrocBillRunsController,
  PresrocCalculateChargeController,
  NotSupportedController
}
