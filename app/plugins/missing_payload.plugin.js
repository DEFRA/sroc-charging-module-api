'use strict'

const Boom = require('@hapi/boom')

/**
 * Check payloads of POST requests and return 400 response if missing
 *
 * When any POST request is made it's because it will be a request to create a record or update one based on the data
 * held in the request payload. To avoid having to put checks into all our POST controller endpoints to test for missing
 * payloads we instead have this plugin.
 */
const MissingPayloadPlugin = {
  name: 'missing_payload',
  register: (server, _options) => {
    server.ext('onPostAuth', (request, h) => {
      if (request.method === 'post' && !request.payload) {
        // returns HTTP 400 response
        return Boom.badRequest('The request is invalid because it does not contain a payload.')
      }

      return h.continue
    })
  }
}

module.exports = MissingPayloadPlugin
