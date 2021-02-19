'use strict'

const AirbrakeRoutes = require('./airbrake.routes')
const AuthorisedSystemRoutes = require('./authorised_system.routes')
const BillRunRoutes = require('./bill_run.routes')
const DatabaseRoutes = require('./database.routes')
const InvoicesRoutes = require('./invoices.routes')
const RegimeRoutes = require('./regime.routes')
const RootRoutes = require('./root.routes')
const TestRoutes = require('./test.routes')
const TransactionRoutes = require('./transaction.routes')
const CalculateChargeRoutes = require('./calculate_charge.routes')

module.exports = {
  AirbrakeRoutes,
  AuthorisedSystemRoutes,
  BillRunRoutes,
  DatabaseRoutes,
  InvoicesRoutes,
  RegimeRoutes,
  RootRoutes,
  TestRoutes,
  TransactionRoutes,
  CalculateChargeRoutes
}
