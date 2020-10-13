const JsonWebToken = require('jsonwebtoken')
const AuthorisationConfig = require('../../../config/authentication.config')

class AuthorisationHelper {
  static adminToken () {
    return this._createToken(AuthorisationConfig.adminClientId)
  }

  static decodeToken (token) {
    return JsonWebToken.decode(token)
  }

  static _createToken (clientId) {
    return JsonWebToken.sign({ client_id: clientId }, 'supersecretkey')
  }
}

module.exports = AuthorisationHelper
