const AuthenticationConfig = require('../../config/authentication.config')
const CognitoJwtToPemService = require('../services/cognito_jwt_to_pem.service')

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

    const scope = ['system']
    const isAdmin = AuthenticationConfig.adminClientId === clientId

    if (isAdmin) {
      scope.push('admin')
    }

    const credentials = { clientId, scope, isAdmin }

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
