'use strict'

/**
 * Our router plugin which pulls in the various routes we have defined ready to be registered with the Hapi server
 * (server.js).
 *
 * You register your routes via a plugin, and by bringing them into this central place it gives us the scope to do
 * things like filter what actually gets registered. A working example might be an endpoints used to support testing and
 * debugging which we don't want registered in the actual production environment.
 *
 * @module router
 */

const {
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
} = require('../routes')

const routes = [
  ...RootRoutes,
  ...AirbrakeRoutes,
  ...AuthorisedSystemRoutes,
  ...BillRunRoutes,
  ...DatabaseRoutes,
  ...InvoicesRoutes,
  ...TestRoutes,
  ...TransactionRoutes,
  ...RegimeRoutes,
  ...CalculateChargeRoutes
]

const router = {
  name: 'router',
  register: (server, _options) => {
    server.route(routes)
  }
}

module.exports = router
