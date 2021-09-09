
'use strict'

/**
 * @module DeprecatedEndpointService
 */

class DeprecatedEndpointService {
  /**
   * Receives a route, checks to see if it has been deprecated (based on the options added to
   * `route.options.app.deprecated` in the route file), and if so returns an object containing headers to be added to
   * the request:
   * - If the `deprecated` object exists in `route.options.app` then `headers.deprecation` will be set to `true`.
   * - If `deprecated.succeeded` is `true` and `deprecated.successor` exists then `headers.link` will contain a link
   *   to the succeeding endpoint.
   *
   * @param {object} route The route object to be checked.
   * @returns {object} Headers to be added to the request.
   */
  static go (route) {
    const headers = {}
    const { deprecated } = route.settings?.app

    if (deprecated) {
      headers.deprecation = true
    }

    if (deprecated?.succeeded && deprecated.successor) {
      headers.link = `<${deprecated.successor}>; rel="successor-version"`
    }

    return headers
  }
}

module.exports = DeprecatedEndpointService
