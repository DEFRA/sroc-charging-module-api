const JsonWebToken = require('jsonwebtoken')
const { AuthenticationConfig } = require('../../../config')

/**
 * Use to help with authentication in tests
 *
 * It contains methods for generating and decoding JSON Web Tokens (JWTs) as well as returning errors related to JWT
 * verification.
 *
 * @see {@link https://jwt.io/|JWT.io}
 */
class AuthorisationHelper {
  /**
   * Generates a JWT with the admin client ID set in the payload
   *
   * @returns {string} A String that represents an encoded JWT
   */
  static adminToken () {
    return this._createToken(AuthenticationConfig.adminClientId)
  }

  /**
   * Generates a JWT with the provided client ID set in the payload
   *
   * Intended for use when you need to generate a JWT which links to a non-admin user in the system. As long as the
   * client ID matches that set when creating the `AuthorisedSystem` record authentication will succeed.
   *
   * @param {string} clientId The ID you wish encoded in the JWT
   * @returns {string} A String that represents an encoded JWT
   */
  static nonAdminToken (clientId) {
    return this._createToken(clientId)
  }

  /**
   * Decode the provided JWT
   *
   * Intended to be used when stubbing the response `JsonWebToken.verify()` returns. You need a decoded version of the
   * encoded bearer token you set in the header for authentication to work.
   *
   * @param {string} token The encoded version of a JWT you wish to be decoded
   * @returns {Object} A decoded version of the token. It wil be made up of a header, payload, and signature. Our
   * authentication strategy relies on the payload containing a `client_id:` that matches an `AuthorisedSystem` record.
   */
  static decodeToken (token) {
    return JsonWebToken.decode(token)
  }

  /**
   * Returns an instance of `JsonWebToken.TokenExpiredError`
   *
   * To mimic our authentication strategy rejecting a request because the JWT bearer token is expired we need to throw
   * an instance of `JsonWebToken.TokenExpiredError` when we stub `JsonWebToken.verify()`.
   *
   * @returns An instance of `JsonWebToken.TokenExpiredError`
   */
  static tokenExpiredError () {
    return new JsonWebToken.TokenExpiredError('jwt expired', Date.now())
  }

  /**
   * Returns an instance of `JsonWebToken.JsonWebTokenError`
   *
   * To mimic our authentication strategy rejecting a request because the JWT bearer token has an invalid signature we
   * need to throw an instance of `JsonWebToken.JsonWebTokenError` when we stub `JsonWebToken.verify()`.
   *
   * @returns An instance of `JsonWebToken.JsonWebTokenError`
   */
  static tokenInvalidSignatureError () {
    return new JsonWebToken.JsonWebTokenError('invalid signature')
  }

  static _createToken (clientId, expired = false) {
    return JsonWebToken.sign({ client_id: clientId }, 'supersecretkey')
  }
}

module.exports = AuthorisationHelper
