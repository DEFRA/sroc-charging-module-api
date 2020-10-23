'use strict'

const AuthenticationConfig = require('../../config/authentication.config')
const { CognitoJwtToPemService } = require('../services')
const { AuthorisedSystemModel } = require('../models')

const authOptions = {
  verifyJWT: true,
  keychain: CognitoJwtToPemService.call(AuthenticationConfig.environment),
  verifyOptions: {
    algorithms: ['RS256'],
    ignoreExpiration: AuthenticationConfig.ignoreJwtExpiration
  },
  validate: async (req, token, h) => {
    /**
     * we asked the plugin to verify the JWT
     * we will get back the decodedJWT as token.decodedJWT
     * and we will get the JWT as token.token
     */
    const { client_id: clientId } = token.decodedJWT

    const authorisedSystem = await AuthorisedSystemModel
      .query()
      .findById(clientId)

    const scope = ['system']

    if (authorisedSystem.admin) {
      scope.push('admin')
    }

    const credentials = { clientId, scope, user: authorisedSystem }

    /**
     * return the decodedJWT to take advantage of hapi's
     * route authentication options
     * https://hapijs.com/api#authentication-options
     */

    return { isValid: true, credentials }
  }
}

module.exports = authOptions
