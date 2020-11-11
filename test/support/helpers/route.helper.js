'use strict'

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
   */
  static addPublicRoute (server) {
    server.route({
      method: 'GET',
      path: '/test/public',
      handler: (_request, _h) => {
        return { type: 'public' }
      },
      options: {
        auth: false
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
      handler: (_request, _h) => {
        return { type: 'wrls' }
      },
      options: {
        auth: {
          scope: ['system']
        }
      }
    })
  }
}

module.exports = RouteHelper
