/**
 * Check if the response we're sending to the client system is a database error.
 * If it is, parse it to provide a better error. Else send the response 'as is'.
 *
 * Mainly to make testing easier, the core logic for parsing database errors and
 * determining how to respond is in the `DbErrorsService`. See it for more
 * details.
 *
 * This solution was heavily inspired by
 * {@link https://andv.medium.com/hapi-transforming-an-internal-server-error-occured-into-correct-boom-errors-1a2a72e6ffff|Hapi — transforming “An internal server error occured” into correct Boom errors}
 *
 * @module DbErrorsPlugin
 */

const { DbErrorsService } = require('../services')

const DbErrorsPlugin = {
  name: 'db_errors',
  register: (server, _options) => {
    server.ext('onPreResponse', (request, h) => {
      const response = request.response

      if (!response.isBoom) {
        return h.continue
      }

      const data = {
        payload: request.payload,
        params: request.params
      }

      return DbErrorsService.go(response, data)
    })
  }
}

module.exports = DbErrorsPlugin
