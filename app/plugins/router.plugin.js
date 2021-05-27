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

const { FilterRoutesService } = require('../services')
const { AuthenticationConfig } = require('../../config')

const {
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
} = require('../routes')

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

module.exports = RouterPlugin
