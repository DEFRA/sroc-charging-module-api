'use strict'

/**
 * @module DeprecatedRoutePlugin
 */

/**
 * As part of our versioning strategy, we need to be able to mark routes as being deprecated:
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
 *           deprecation: {
 *             successor: '/not-deprecated'
 *           }
 *         }
 *       }
 *     }
 *   ]
 *
 * As defined in the link above, we set the following headers:
 *
 * - deprecation: This is `true` if the route is deprecated, which is denoted by the presence of the `deprecation`
 *   object -- regardless of whether or not the object actually contains anything. If the route isn't deprecated then
 *   the header won't be added.
 * - link: This is a link in the form `</not-deprecated>; rel="successor-version"` if a successor route is defined;
 *   otherwise, it is not added. An example of a deprecated route without a successor would be:
 *
 *   const routes = [
 *     {
 *       method: 'GET',
 *       path: '/deprecated',
 *       handler: Controller.handler,
 *       options: {
 *         app: {
 *           deprecation: {
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
const isDeprecated = deprecation => deprecation ? true : undefined

/**
 * Returns successor link if deprecation.successor exists, otherwise returns undefined
 */
const successorLink = deprecation => deprecation?.successor ? `<${deprecation.successor}>; rel="successor-version"` : undefined

const addHeaders = (response, headers) => {
  for (const header in headers) {
    response.header(header, headers[header])
  }
}

const DeprecatedRoutePlugin = {
  name: 'deprecated_route',
  register: (server, _options) => {
    server.ext('onPreResponse', (request, _h) => {
      const { route, response } = request

      const headers = deprecationHeaders(route)
      addHeaders(response, headers)

      return response
    })
  }
}

module.exports = DeprecatedRoutePlugin
