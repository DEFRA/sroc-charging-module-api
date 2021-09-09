
'use strict'

/**
 * @module DeprecatedEndpointService
 */

class DeprecatedEndpointService {
  /**
   *
   *
   * @param {*} route
   * @returns
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
