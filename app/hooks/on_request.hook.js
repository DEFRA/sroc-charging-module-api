const Boom = require('@hapi/boom')

const onRequest = (request, h) => {
  if (request.method === 'post' && !request.payload) {
    // return HTTP 400
    return Boom.badRequest('No payload')
  }

  return h.continue
}

module.exports = onRequest
