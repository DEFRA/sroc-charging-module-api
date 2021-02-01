'use strict'

/**
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
