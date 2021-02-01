'use strict'

/**
 * @module DbErrorsService
 */

const Boom = require('@hapi/boom')
const { DBError, UniqueViolationError } = require('db-errors')

class DbErrorsService {
  static go (error, data = {}) {
    if (error instanceof DBError) {
      return this._parseError(error, data)
    } else {
      return error
    }
  }

  static _parseError (error, data) {
    if (error instanceof UniqueViolationError) {
      return this._uniqueViolationError(error, data)
    } else {
      return this._dbError(error)
    }
  }

  static _uniqueViolationError (error, data) {
    let message

    if (error.constraint === 'transactions_regime_id_client_id_unique') {
      const regimeId = data.params.regimeId
      message = `A transaction with Client ID '${data.payload.clientId}' for Regime '${regimeId}' already exists.`
    } else {
      message = `${error.name} - ${error.nativeError.detail}`
    }

    return new Boom.Boom(
      message,
      { statusCode: 409 }
    )
  }

  static _dbError (error) {
    const message = `${error.name} - ${error.nativeError.detail}`

    return new Boom.Boom(
      message,
      { statusCode: 400 }
    )
  }
}

module.exports = DbErrorsService
