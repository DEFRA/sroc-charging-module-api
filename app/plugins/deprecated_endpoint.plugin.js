'use strict'

/**
 * @module DeprecatedEndpointPlugin
 */

const { DeprecatedEndpointService } = require('../services')

/**
 *
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
