'use strict'

const AirbrakeRoutes = require('./airbrake.routes')
const AuthorisedSystemRoutes = require('./authorised_system.routes')
const BillRunRoutes = require('./bill_run.routes')
const RegimeRoutes = require('./regime.routes')
const RootRoutes = require('./root.routes')
const TransactionRoutes = require('./transaction.routes')
const CalculateChargeRoutes = require('./calculate_charge.routes')

module.exports = {
  AirbrakeRoutes,
  AuthorisedSystemRoutes,
  BillRunRoutes,
  RegimeRoutes,
  RootRoutes,
  TransactionRoutes,
  CalculateChargeRoutes
}
