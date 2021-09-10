'use strict'

/**
 * @module DeprecatedEndpointPlugin
 */

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
 *             successor: '/not-deprecated'
 *           }
 *         }
 *       }
 *     }
 *   ]
 *
 * As defined in the link above, we set the following headers:
 *
 * - deprecation: This is `true` if the endpoint is deprecated (which is set by the presence of the `deprecated`
 *   object), or will not be added if it isn't deprecated.
 * - link: This is a link in the form `</not-deprecated>; rel="successor-version"` if a successor endpoint is defined;
 *   otherwise, it is not added. An example of a deprecated endpoint without a successor is:
 *
 *   const routes = [
 *     {
 *       method: 'GET',
 *       path: '/deprecated',
 *       handler: Controller.handler,
 *       options: {
 *         app: {
 *           deprecated: {
 *           }
 *         }
 *       }
 *     }
 *   ]
 */

/**
 * Returns deprecation headers based on options in route.settings.app.deprecation
 */
const deprecationHeaders = route => {
  const { deprecation } = route.settings?.app

  return {
    deprecation: isDeprecated(deprecation),
    link: successorLink(deprecation)
  }
}

/**
 * Returns true if deprecation object exists, otherwise returns undefined
 */
const isDeprecated = deprecation => {
  return deprecation ? true : undefined
}

/**
 * Returns successor link if deprecation.successor exists, otherwise returns undefined
 */
const successorLink = deprecation => {
  return deprecation?.successor ? `<${deprecation.successor}>; rel="successor-version"` : undefined
}

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

      const headers = deprecationHeaders(route)
      addHeaders(response, headers)

      return response
    })
  }
}

module.exports = DeprecatedEndpointPlugin
