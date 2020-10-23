'use strict'

const Hapi = require('@hapi/hapi')
const ServerConfig = require('./config/server.config')
const { JwtStrategyAuth } = require('./app/auth')
const {
  AirbrakePlugin,
  BlippPlugin,
  DisinfectPlugin,
  HapiNowAuthPlugin,
  HpalDebugPlugin,
  RouterPlugin
} = require('./app/plugins')
const { OnCredentialsHook, OnRequestHook } = require('./app/hooks')

exports.deployment = async (start) => {
  // Create the hapi server
  const server = Hapi.server(ServerConfig)

  // Register our auth plugin and then the strategies (needs to be done in this
  // order)
  await server.register(HapiNowAuthPlugin)
  server.auth.strategy('jwt-strategy', 'hapi-now-auth', JwtStrategyAuth)
  server.auth.default('jwt-strategy')

  // Register the remaining plugins
  await server.register(RouterPlugin)
  await server.register(DisinfectPlugin)
  await server.register(AirbrakePlugin)
  await server.register(BlippPlugin)
  await server.register(HpalDebugPlugin)

  server.ext('onRequest', OnRequestHook)
  server.ext('onCredentials', OnCredentialsHook)

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
