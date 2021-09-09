'use strict'

/**
 * @module DeprecatedEndpointPlugin
 */

/**
 *
 */

const DeprecatedEndpointPlugin = {
  name: 'deprecated_endpoint',
  register: (server, _options) => {
    server.ext('onPreResponse', (request, _h) => {
      const response = request.response
      return response
    })
  }
}

module.exports = DeprecatedEndpointPlugin
