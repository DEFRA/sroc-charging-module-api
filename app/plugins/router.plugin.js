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

import AirbrakeRoutes from '../routes/airbrake.routes.js'
import AuthorisedSystemRoutes from '../routes/authorised_system.routes.js'
import BillRunInvoiceRoutes from '../routes/bill_run_invoice.routes.js'
import BillRunLicenceRoutes from '../routes/bill_run_licence.routes.js'
import BillRunRoutes from '../routes/bill_run.routes.js'
import BillRunTransactionRoutes from '../routes/bill_run_transaction.routes.js'
import CalculateChargeRoutes from '../routes/calculate_charge.routes.js'
import CustomerDetailsRoutes from '../routes/customer_details.routes.js'
import CustomerRoutes from '../routes/customer.routes.js'
import DatabaseRoutes from '../routes/database.routes.js'
import RegimeRoutes from '../routes/regime.routes.js'
import RootRoutes from '../routes/root.routes.js'
import TestRoutes from '../routes/test.routes.js'
import TransactionRoutes from '../routes/transaction.routes.js'

import FilterRoutesService from '../services/plugins/filter_routes.service.js'

import AuthenticationConfig from '../../config/authentication.config.js'

const routes = [
  ...RootRoutes,
  ...AirbrakeRoutes,
  ...AuthorisedSystemRoutes,
  ...BillRunRoutes,
  ...BillRunInvoiceRoutes,
  ...BillRunLicenceRoutes,
  ...BillRunTransactionRoutes,
  ...CustomerDetailsRoutes,
  ...CustomerRoutes,
  ...DatabaseRoutes,
  ...TestRoutes,
  ...TransactionRoutes,
  ...RegimeRoutes,
  ...CalculateChargeRoutes
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

export default RouterPlugin
