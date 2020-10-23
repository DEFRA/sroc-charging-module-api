'use strict'

const Boom = require('@hapi/boom')

const onRequest = (req, h) => {
  if (req.method === 'post' && !req.payload) {
    // return HTTP 400
    return Boom.badRequest('No payload')
  }

  return h.continue
}

module.exports = onRequest
