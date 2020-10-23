'use strict'

/*
  Our router plugin which pulls in the various routes we have defined ready
  to be registered with the Hapi server (app/index.js).

  You register your routes via a plugin, and by bringing them into this
  central place it gives us the scope to do things like filter what actually
  gets registered. A working example might be an endpoints used to support
  testing and debugging which we don't want registered in the actual
  production environment.
*/

const RootRoutes = require('../routes/root.routes')
const AirbrakeRoutes = require('../routes/airbrake.routes')
const BillRunRoutes = require('../routes/bill_run.routes')
const TransactionRoutes = require('../routes/transaction.routes')
const RegimesRoutes = require('../routes/regimes.routes')

const routes = [
  ...RootRoutes,
  ...AirbrakeRoutes,
  ...BillRunRoutes,
  ...TransactionRoutes,
  ...RegimesRoutes
]

const router = {
  name: 'router',
  register: (server, options) => {
    server.route(routes)
  }
}

module.exports = router
