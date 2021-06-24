const Boom = require('@hapi/boom')
const { AuthorisationService } = require('../services')

/**
 * Checks the client is authorised to access the requested endpoint
 *
 * Paths under the `/admin` root are only accessible to requests made with bearer tokens generated using the admin
 * client ID.
 *
 * Paths which have a regime, for example, `/v1/{regimeId}/billruns` are accessible to the admin user plus any request
 * made with a bearer token generated using a recognised client ID. However, the client ID must also be linked to the
 * matching regime.
 *
 * If it's not on the `/admin` path and doesn't feature a regime, for example, `/status` then all requests are accepted.
 *
 * If the request _is_ for a regime endpoint we take advantage of the fact the `AuthorisationService` returns an
 * instance of `RegimeModel` and store it in the `request.app`. This means any subsequent need for accessing the regime
 * record can be served by grabbing it from the request. See
 * {@link https://hapi.dev/api/?v=20.0.2#-requestapp|request.app} for details.
 */
const AuthorisationPlugin = {
  name: 'authorisation',
  register: (server, _options) => {
    server.ext('onCredentials', async (request, h) => {
      const { user } = request.auth.credentials
      const { regimeId } = request.params

      const authorisationResult = await AuthorisationService.go(user, regimeId)

      if (authorisationResult.authorised) {
        request.app.regime = authorisationResult.regime
        return h.continue
      }

      throw Boom.forbidden(`Unauthorised for regime '${regimeId}'`)
    })
  }
}

module.exports = AuthorisationPlugin
