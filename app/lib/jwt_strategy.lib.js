const { AuthenticationConfig } = require('../../config')
const { CognitoJwtToPemService } = require('../services')
const { AuthorisedSystemModel } = require('../models')
const Boom = require('@hapi/boom')

const authOptions = {
  verifyJWT: true,
  keychain: CognitoJwtToPemService.go(AuthenticationConfig.environment),
  verifyOptions: {
    algorithms: ['RS256'],
    ignoreExpiration: AuthenticationConfig.ignoreJwtExpiration
  },
  validate: async (_req, token, _h) => {
    // We asked the plugin to verify the JWT. So we get back the decodedJWT as `token.decodedJWT` and the original JWT
    // bearer token as `token.token`
    const { client_id: clientId } = token.decodedJWT

    // Find the authorised system with a matching client ID
    const authorisedSystem = await AuthorisedSystemModel.query()
      .findOne({ client_id: clientId })

    // No matching authorised system found
    if (!authorisedSystem) {
      // We throw a Boom error rather than returning `isValid: false` as it allows us to control the error message. If
      // we didn't the client would just get the message 'Bad token'
      throw Boom.unauthorized(`The client ID '${clientId}' is not recognised`)
    }

    if (!authorisedSystem.$active()) {
      // We return a 403 rather than a 401 because the credentials are for a valid user (so they are authenticated) but
      // because the user is not 'active' they are forbidden from accessing any functionality (not authorized)
      throw Boom.forbidden(`Client ID '${clientId}' is no longer active`)
    }

    // We use the `options.auth.scope` property on our routes to manage authorisation and what endpoints a client can
    // access. Public endpoints have a scope of `system`. Admin can access these as well as those with only a scope of
    // `admin`.
    const scope = ['system']

    if (authorisedSystem.admin) {
      scope.push('admin')
    }

    // Create our credentials object which will hold the client ID scopes this client can access, and the instance of
    // AuthorisedSystem (user). These will then be available via the request object (`req.auth.credentials`)
    const credentials = { clientId, scope, user: authorisedSystem }

    // We have to return an object with these named properties else the HapiNowAuth plugin errors
    return { isValid: true, credentials }
  }
}

module.exports = authOptions
