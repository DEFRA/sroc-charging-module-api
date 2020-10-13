const AuthenticationConfig = require('../../config/authentication.config')
const CognitoJwtToPemService = require('../services/cognito_jwt_to_pem.service')
const AuthorisedSystemModel = require('../models/authorised_system.model')

const authOptions = {
  verifyJWT: true,
  keychain: CognitoJwtToPemService.call(AuthenticationConfig.environment),
  verifyOptions: {
    algorithms: ['RS256'],
    ignoreExpiration: true
  },
  validate: async (request, token, h) => {
    let isValid = false

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
    isValid = true
    return { isValid, credentials }
  }
}

module.exports = authOptions
