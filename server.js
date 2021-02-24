'use strict'

const Hapi = require('@hapi/hapi')
const { ServerConfig, TestConfig } = require('./config')
const { JwtStrategyAuth } = require('./app/auth')
const {
  AirbrakePlugin,
  AuthorisationPlugin,
  BillRunPlugin,
  BlippPlugin,
  DbErrorsPlugin,
  HpalDebugPlugin,
  HapiNowAuthPlugin,
  HapiPinoPlugin,
  InvalidCharactersPlugin,
  MissingPayloadPlugin,
  PayloadCleanerPlugin,
  RouterPlugin,
  StopPlugin,
  VersionInfoPlugin
} = require('./app/plugins')

exports.deployment = async start => {
  // Create the hapi server
  const server = Hapi.server(ServerConfig.hapi)

  // Register our auth plugin and then the strategies (needs to be done in this
  // order)
  await server.register(HapiNowAuthPlugin)
  server.auth.strategy('jwt-strategy', 'hapi-now-auth', JwtStrategyAuth)
  server.auth.default('jwt-strategy')

  // Register the remaining plugins
  await server.register(StopPlugin)
  await server.register(AuthorisationPlugin)
  await server.register(RouterPlugin)
  await server.register(AirbrakePlugin)
  await server.register(MissingPayloadPlugin)
  await server.register(InvalidCharactersPlugin)
  await server.register(PayloadCleanerPlugin)
  await server.register(DbErrorsPlugin)
  await server.register(VersionInfoPlugin)
  await server.register(HapiPinoPlugin(TestConfig.logInTest))
  await server.register(BillRunPlugin)

  // Register non-production plugins
  if (ServerConfig.environment === 'development') {
    await server.register(BlippPlugin)
    await server.register(HpalDebugPlugin)
  }

  await server.initialize()

  if (start) {
    await server.start()
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

  process.on('unhandledRejection', err => {
    throw err
  })
}
