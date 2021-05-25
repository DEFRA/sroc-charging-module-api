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

const { RouteAuthOptionsService } = require('../services')
const { AuthenticationConfig } = require('../../config')

const {
  AirbrakeRoutes,
  AuthorisedSystemRoutes,
  BillRunRoutes,
  BillRunInvoiceRoutes,
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
    const authCheckedRoutes = routes.map(route => RouteAuthOptionsService.go(route, AuthenticationConfig.environment))

    server.route(authCheckedRoutes)
  }
}

module.exports = RouterPlugin
