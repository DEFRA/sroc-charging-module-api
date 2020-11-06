'use strict'

const Boom = require('@hapi/boom')

const onRequest = (req, h) => {
  if (req.method === 'post' && !req.payload) {
    // return HTTP 400
    return Boom.badRequest('The request is invalid because it does not contain a payload.')
  }

  return h.continue
}

module.exports = onRequest
