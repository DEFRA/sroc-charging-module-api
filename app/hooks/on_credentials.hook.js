const Boom = require('@hapi/boom')

const onCredentials = (req, h) => {
  const { user } = req.auth.credentials
  const { regimeId } = req.params

  // admin is always authorised to access regimes
  if (user.admin) {
    console.log('ADMIN')
    return h.continue
  }

  // No specific authorisation is needed if the endpoint doesn't contain a regime
  if (!regimeId) {
    console.log('No authorisation needed for this endpoint')
    return h.continue
  }

  if (regimeId !== user.name) {
    return Boom.forbidden(`Unauthorised for regime '${regimeId}'`)
  }

  return h.continue
}

module.exports = onCredentials
