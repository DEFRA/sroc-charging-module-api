const Hapi = require('@hapi/hapi')
const ServerConfig = require('./config/server.config')

exports.deployment = async (start) => {
  // Create the hapi server
  const server = Hapi.server(ServerConfig)

  // Register our auth plugin and then the strategies (needs to be done in this
  // order)
  await server.register(require('./app/plugins/hapi_now_auth.plugin'))
  server.auth.strategy('jwt-strategy', 'hapi-now-auth', require('./app/auth/jwt_strategy.auth'))
  server.auth.default('jwt-strategy')

  // Register the remaining plugins
  await server.register(require('./app/plugins/router.plugin'))
  await server.register(require('./app/plugins/blipp.plugin'))
  await server.register(require('./app/plugins/hpal_debug.plugin'))
<<<<<<< HEAD
  await server.register(require('./app/plugins/disinfect.plugin'))
=======
  await server.register(require('./app/plugins/airbrake.plugin'))
>>>>>>> 607c187... Add airbrake implementation

  server.ext('onRequest', require('./app/hooks/on_request.hook'))
  server.ext('onCredentials', require('./app/hooks/on_credentials.hook'))

  await server.initialize()

  if (start) {
    await server.start()
    console.log(`Server started at ${server.info.uri}`)
  }

  return server
}

// The docs for hpal and hpal-debug tell you to use
//
//   if (!module.parent) { .. }
//
// However, `module.parent` is deprecated as of v14.6.0. This is an alternative
// solution to working out if the module was directly run (node server.js) or
// required (npx hpal run)
if (require.main === module) {
  exports.deployment(true)

  process.on('unhandledRejection', (err) => {
    throw err
  })
}
