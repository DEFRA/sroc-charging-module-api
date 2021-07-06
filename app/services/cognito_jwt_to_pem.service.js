/**
 * @module CognitoJwtToPemService
 */

import fs from 'fs'
import JwkToPem from 'jwk-to-pem'
import path from 'path'

// __dirname would ordinarily give the current directory if used in a CommonJS Node module. But it's not availabe in an
// ES6 one. So, we can use this to instead to obtain the current directory. We use the standard variable name for
// consistency
const __dirname = path.dirname(new URL(import.meta.url).pathname)

export default class CognitoJwtToPemService {
  static go (environment) {
    const pems = this._convertJwksToPems(environment)

    return pems
  }

  static _convertJwksToPems (environment) {
    const jwks = this._getKeys(environment).keys

    return jwks.map(key => this._pemFromJwk(key))
  }

  static _getKeys (environment) {
    const keyFilePath = path.join(__dirname, '..', '..', 'keys', `${environment}.jwk.json`)
    const data = fs.readFileSync(keyFilePath)

    return JSON.parse(data)
  }

  static _pemFromJwk (key) {
    return JwkToPem(key)
  }
}
