'use strict'

'use strict'

const Boom = require('@hapi/boom')

/**
 * Checks the client is authorised to access the requested endpoint
 *
 * Paths under the `/admin` root are only accessible to requests made with bearer tokens generated using the admin
 * client ID.
 *
 * Paths which have a regime, for example, `/v1/{regimeId}/billruns`are accessible to the admin user plus any request
 * made with a bearer token generated using a recognised client ID.
 *
 * If it's not on the `/admin` path and doesn't feature a regime, for example, `/status` then all requests are accepted.
 */
const AuthorisationPlugin = {
  name: 'authorisation',
  register: (server, _options) => {
    server.ext('onCredentials', (request, h) => {
      const { user } = request.auth.credentials
      const { regimeId } = request.params

      // admin is always authorised to access regimes
      if (user.admin) {
        request.log(['INFO'], 'User is an admin')
        return h.continue
      }

      // No specific authorisation is needed if the endpoint doesn't contain a regime
      if (!regimeId) {
        request.log(['INFO'], 'No authorisation needed for this endpoint')
        return h.continue
      }

      if (regimeId !== user.name) {
        return Boom.forbidden(`Unauthorised for regime '${regimeId}'`)
      }

      return h.continue
    })
  }
}

module.exports = AuthorisationPlugin
