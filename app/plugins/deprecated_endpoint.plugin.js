'use strict'

/**
 * @module DeprecatedEndpointPlugin
 */

const { DeprecatedEndpointService } = require('../services')

/**
 * As part of our versioning strategy, we need to be able to mark endpoints as being deprecated:
 * https://blog.stoplight.io/deprecating-api-endpoints
 *
 * We do this by adding the deprecation info to the route inside `options.app` (the recommended place to store our
 * service's options), eg:
 *
 *   const routes = [
 *     {
 *       method: 'GET',
 *       path: '/deprecated',
 *       handler: Controller.handler,
 *       options: {
 *         app: {
 *           deprecated: {
 *             succeeded: true,
 *             successor: '/not-deprecated'
 *           }
 *         }
 *       }
 *     }
 *   ]
 *
 * This plugin passes the route to DeprecatedEndpointService, which will determine whether the route is deprecated and
 * if so, returns the required headers to be added to the response. As defined in the link above, we set the following
 * headers:
 *
 * - deprecation: This is `true` if the endpoint is deprecated, or will not be added if it isn't deprecated.
 * - link: This is a link in the form `</not-deprecated>; rel="successor-version"` if the endpoint is marked as
 *   succeeded and a successor endpoint is defined; otherwise, it is not added.
 */

const addHeaders = (response, headers) => {
  for (const header in headers) {
    response.header(header, headers[header])
  }
}

const DeprecatedEndpointPlugin = {
  name: 'deprecated_endpoint',
  register: (server, _options) => {
    server.ext('onPreResponse', (request, _h) => {
      const { route, response } = request

      const headers = DeprecatedEndpointService.go(route)
      addHeaders(response, headers)

      return response
    })
  }
}

module.exports = DeprecatedEndpointPlugin
