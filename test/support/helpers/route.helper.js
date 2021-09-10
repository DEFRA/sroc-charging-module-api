'use strict'

// We don't know why but when we added `TestBillRunController` and specifically added it to `app/controllers/index` this
// require started failing. After some investigation we tracked it down to the controller's `require BillRunGenerator`
// call. Take that out and all is well. Leave it in and
// `const { NotSupportedController } = require('../../../app/controllers')` would fail. Requiring the
// NotSupportedController directly resolves the issue.
//
// We suspect it's a circular dependency where something in the chain is requiring RouteHelper causing it to cycle back
// again. TLDR; you need to NotSupportedController in this way to avoid an error
const NotSupportedController = require('../../../app/controllers/not_supported.controller')

/**
 * A helper that provides test routes.
 *
 * When testing you might need to add a route for which you control its config and options, for example, testing of
 * public and private endpoints.
 *
 * Use this helper to access routes that can be added to the server as part of your tests.
 */
class RouteHelper {
  /**
   * Adds a route to a Hapi server instance which requires no authorisation to access.
   *
   * Intended to mimic routes such as `/` and `/status` which anyone can access.
   *
   * @param {Object} server A Hapi server instance
   * @param {Object} additionalOptions Additional options to be added to the route
   */
  static addPublicRoute (server, additionalOptions = {}) {
    server.route({
      method: 'GET',
      path: '/test/public',
      handler: (_request, _h) => {
        return { type: 'public' }
      },
      options: {
        auth: false,
        ...additionalOptions
      }
    })
  }

  /**
   * Adds a route to a Hapi server instance which can only be accessed by the admin client.
   *
   * Intended to mimic routes such as `/admin/regimes` and those under `/admin/health/`.
   *
   * @param {Object} server A Hapi server instance
   */
  static addAdminRoute (server) {
    server.route({
      method: 'GET',
      path: '/test/admin',
      handler: (_request, _h) => {
        return { type: 'admin' }
      },
      options: {
        auth: {
          scope: ['admin']
        }
      }
    })
  }

  /**
   * Adds a POST route to a Hapi server instance which will return whatever was in the payload
   *
   * Intended for testing plugins which may alter a payload before a controller has visibility of it.
   *
   * @param {Object} server A Hapi server instance
   */
  static addPublicPostRoute (server) {
    server.route({
      method: 'POST',
      path: '/test/post',
      handler: (request, _h) => {
        return request.payload
      },
      options: {
        auth: false
      }
    })
  }

  /**
   * Adds a route to a Hapi server instance which can only accessed by authorised systems and the admin.
   *
   * Intended to mimic routes such as `/v1/{regimeId}/billruns`.
   *
   * @param {Object} server A Hapi server instance
   */
  static addSystemGetRoute (server) {
    server.route({
      method: 'GET',
      path: '/test/{regimeId}/system',
      handler: (request, _h) => {
        return { type: request.app.regime.slug }
      },
      options: {
        auth: {
          scope: ['system']
        }
      }
    })
  }

  /**
   * Adds a route to a Hapi server instance which replicates an unsupported route.
   *
   * This supports testing that when we flag a route as 'unsupported' it behaves as we expect. For example, we are
   * flagging that the /v1 versions of a number of endpoints are not supported in this project.
   */
  static addNotSupportedRoute (server) {
    server.route({
      method: 'GET',
      path: '/test/not-supported',
      handler: NotSupportedController.index,
      options: {
        auth: false
      }
    })
  }

  /**
   * Adds a route to a Hapi server instance which mocks a bill run `GET`.
   *
   * Intended to mimic routes such as `/v1/{regimeId}/bill-runs/{billRunId}`.
   *
   * @param {Object} server A Hapi server instance
   */
  static addBillRunGetRoute (server) {
    server.route({
      method: 'GET',
      path: '/test/{regimeId}/bill-runs/{billRunId}',
      handler: (request, _h) => {
        return { id: request.app.billRun.id }
      },
      options: {
        auth: {
          scope: ['system']
        }
      }
    })
  }

  static addRequestAppCheckRoute (server, type) {
    const paths = {
      billRun: '/test/{regimeId}/bill-runs/{billRunId}',
      invoice: '/test/{regimeId}/invoices/{invoiceId}'
    }

    server.route({
      method: 'GET',
      path: paths[type],
      handler: (request, _h) => {
        return { id: request.app[type].id }
      },
      options: {
        auth: {
          scope: ['system']
        }
      }
    })
  }

  /**
   * Adds a route to a Hapi server instance which is used to test the 'Notifier' plugin
   *
   * This is used to confirm that an instance of `Notifier` was added to `request.app` by the plugin for all requests.
   *
   * @param {Object} server A Hapi server instance
   */
  static addNotifierRoute (server) {
    server.route({
      method: 'GET',
      path: '/test/notifier',
      handler: (request, _h) => {
        return { exists: request.app.notifier ? 'yes' : 'no' }
      },
      options: {
        auth: false
      }
    })
  }
}

module.exports = RouteHelper
