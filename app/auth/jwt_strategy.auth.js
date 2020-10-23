'use strict'

const { AuthenticationConfig } = require('../../config')
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
    // We asked the plugin to verify the JWT. So we get back the decodedJWT as `token.decodedJWT` and the original JWT
    // bearer token as `token.token`
    const { client_id: clientId } = token.decodedJWT

    // Find the authorised system with a matching client ID
    const authorisedSystem = await AuthorisedSystemModel
      .query()
      .findById(clientId)

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
