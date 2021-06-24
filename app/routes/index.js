const AirbrakeRoutes = require('./airbrake.routes')
const AuthorisedSystemRoutes = require('./authorised_system.routes')
const BillRunRoutes = require('./bill_run.routes')
const BillRunInvoiceRoutes = require('./bill_run_invoice.routes')
const BillRunLicenceRoutes = require('./bill_run_licence.routes')
const BillRunTransactionRoutes = require('./bill_run_transaction.routes')
const CustomerDetailsRoutes = require('./customer_details.routes')
const CustomerRoutes = require('./customer.routes')
const DatabaseRoutes = require('./database.routes')
const RegimeRoutes = require('./regime.routes')
const RootRoutes = require('./root.routes')
const TestRoutes = require('./test.routes')
const TransactionRoutes = require('./transaction.routes')
const CalculateChargeRoutes = require('./calculate_charge.routes')

module.exports = {
  AirbrakeRoutes,
  AuthorisedSystemRoutes,
  BillRunRoutes,
  BillRunInvoiceRoutes,
  BillRunLicenceRoutes,
  BillRunTransactionRoutes,
  CustomerDetailsRoutes,
  CustomerRoutes,
  DatabaseRoutes,
  RegimeRoutes,
  RootRoutes,
  TestRoutes,
  TransactionRoutes,
  CalculateChargeRoutes
}
