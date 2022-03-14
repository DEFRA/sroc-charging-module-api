'use strict'

/**
 * Our router plugin which pulls in the various routes we have defined ready to be registered with the Hapi server
 * (server.js).
 *
 * You register your routes via a plugin, and by bringing them into this central place it gives us the scope to do
 * things like filter what actually gets registered. A working example might be an endpoints used to support testing and
 * debugging which we don't want registered in the actual production environment.
 *
 * @module RouterPlugin
 */

const FilterRoutesService = require('../services/plugins/filter_routes.service.js')
const AuthenticationConfig = require('../../config/authentication.config.js')

const AirbrakeRoutes = require('../routes/airbrake.routes')
const AuthorisedSystemRoutes = require('../routes/authorised_system.routes')
const BillRunRoutes = require('../routes/bill_run.routes')
const BillRunInvoiceRoutes = require('../routes/bill_run_invoice.routes')
const BillRunLicenceRoutes = require('../routes/bill_run_licence.routes')
const BillRunTransactionRoutes = require('../routes/bill_run_transaction.routes')
const CalculateChargeRoutes = require('../routes/calculate_charge.routes')
const CustomerDetailsRoutes = require('../routes/customer_details.routes')
const CustomerFilesRoutes = require('../routes/customer_files.routes')
const CustomerRoutes = require('../routes/customer.routes')
const DatabaseRoutes = require('../routes/database.routes')
const RegimeRoutes = require('../routes/regime.routes')
const RootRoutes = require('../routes/root.routes')
const TestRoutes = require('../routes/test.routes')
const TransactionRoutes = require('../routes/transaction.routes')

const routes = [
  ...RootRoutes,
  ...AirbrakeRoutes,
  ...AuthorisedSystemRoutes,
  ...BillRunRoutes,
  ...BillRunInvoiceRoutes,
  ...BillRunLicenceRoutes,
  ...BillRunTransactionRoutes,
  ...CalculateChargeRoutes,
  ...CustomerDetailsRoutes,
  ...CustomerFilesRoutes,
  ...CustomerRoutes,
  ...DatabaseRoutes,
  ...TestRoutes,
  ...TransactionRoutes,
  ...RegimeRoutes
]

const RouterPlugin = {
  name: 'router',
  register: (server, _options) => {
    // Filter our any routes which should not be registered. Typically, these will be unfinished endpoints we filter
    // out when running in production
    const filteredRoutes = FilterRoutesService.go(routes, AuthenticationConfig.environment)

    server.route(filteredRoutes)
  }
}

module.exports = RouterPlugin
