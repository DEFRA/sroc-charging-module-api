'use strict'

/**
 * @module CleanPayloadPlugin
 */

const Boom = require('@hapi/boom')
const { UniqueViolationError } = require('db-errors')

const parseError = (error, data) => {
  if (error instanceof UniqueViolationError) {
    return handleUniqueViolationError(error, data)
  } else {
    return error
  }
}

const handleUniqueViolationError = (error, data) => {
  console.log(JSON.stringify(error))
  const regimeId = data.params.regimeId
  let message

  if (error.constraint === 'transactions_regime_id_client_id_unique') {
    message = `A transaction with Client ID '${data.payload.clientId}' for Regime '${regimeId}' already exists.`
  } else {
    message = `${error.name} - ${error.nativeError.detail}`
  }

  return new Boom.Boom(
    message,
    { statusCode: 409 }
  )
}

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

      return parseError(response, data)
    })
  }
}

module.exports = DbErrorsPlugin
