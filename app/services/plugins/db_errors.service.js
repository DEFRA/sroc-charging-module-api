/**
 * @module DbErrorsService
 */

const Boom = require('@hapi/boom')
const { DBError, UniqueViolationError } = require('db-errors')

class DbErrorsService {
  /**
   * Determine if the passed in error is an instance of `DBError` and if so generate the appropriate response
   *
   * Without this service and the associated `DbErrorsPlugin`, if a database error occurs the user will just get a
   * generic '500' response with no details.
   *
   * We have specific cases where we need to provide a more detailed response, for example, if an attempt is made to
   * create a transaction with a duplicate `clientId` for the same regime. Also, if we send a
   * {@link https://hapi.dev/module/boom/api/?v=9.1.1#boombadimplementationmessage-data---alias-internal|Boom 5xx}
   * we cannot provide any extra info for the client.
   *
   * > [Boom docs] All 500 errors hide your message from the end user.
   *
   * So if the database error is not something we handle, we return a generic
   * {@link https://hapi.dev/module/boom/api/?v=9.1.1#boombadrequestmessage-data|Boom 400} response with detail that
   * indicates the root issue. If it is something we handle, the Boom response we generate will use a more appropriate
   * status code and feature a tailored message detailing the problem.
   *
   * @param {Object} error The error to be assessed and handled. It is assumed this has been provided by the plugin and
   * taken from `request.response`. If its not an instance of `DBError, the service will just return it
   * @param {Object} data Data taken from the request. The service assumes data will contain both a `payload` and
   * `params` property and will use this information to tailor the message we respond to the client with
   *
   * @returns {module:Boom} A boom error object
   */
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
    let boomError

    if (error.constraint === 'transactions_regime_id_client_id_unique') {
      boomError = new Boom.Boom(
        `A transaction with Client ID '${data.payload.clientId}' for Regime '${data.params.regimeId}' already exists.`,
        { statusCode: 409 }
      )
      boomError.output.payload.clientId = data.payload.clientId
    } else {
      boomError = new Boom.Boom(
        `${error.name} - ${error.nativeError.detail}`,
        { statusCode: 409 }
      )
    }

    return boomError
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
