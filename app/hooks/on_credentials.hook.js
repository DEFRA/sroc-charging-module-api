const onCredentials = (request, h) => {
  if (request.auth.credentials.isAdmin) {
    console.log('ADMIN')
    return h.continue
  }

  return h.continue
}

module.exports = onCredentials
