/**
 * @module CognitoJwtToPemService
 */

const JwkToPem = require('jwk-to-pem')

class CognitoJwtToPemService {
  static go (environment) {
    return this._convertJwksToPems(environment)
  }

  static _convertJwksToPems (environment) {
    const jwks = this._getKeys(environment).keys

    return jwks.map(key => this._pemFromJwk(key))
  }

  static _getKeys (environment) {
    return require(`../../keys/${environment}.jwk.json`)
  }

  static _pemFromJwk (key) {
    return JwkToPem(key)
  }
}

module.exports = CognitoJwtToPemService
