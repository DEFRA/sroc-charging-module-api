'use strict'

const Boom = require('@hapi/boom')

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
