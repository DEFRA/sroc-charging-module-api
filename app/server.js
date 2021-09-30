'use strict'

const Hapi = require('@hapi/hapi')
const Joi = require('joi')
const GlobalAgent = require('global-agent')

const { ServerConfig, TestConfig } = require('../config')
const { JwtStrategyAuthLib } = require('./lib')
const {
  AirbrakePlugin,
  AuthorisationPlugin,
  BlippPlugin,
  DbErrorsPlugin,
  DeprecatedRoutePlugin,
  HapiNowAuthPlugin,
  HapiPinoPlugin,
  InvalidCharactersPlugin,
  MissingPayloadPlugin,
  PayloadCleanerPlugin,
  RequestBillRunPlugin,
  RequestInvoicePlugin,
  RequestLicencePlugin,
  RequestNotifierPlugin,
  RouterPlugin,
  StopPlugin,
  VersionInfoPlugin
} = require('./plugins')

const registerPlugins = async (server) => {
  // Register our auth plugin and then the strategies (needs to be done in this order)
  await server.register(HapiNowAuthPlugin)
  server.auth.strategy('jwt-strategy', 'hapi-now-auth', JwtStrategyAuthLib)
  server.auth.default('jwt-strategy')

  // Register the remaining plugins
  await server.register(StopPlugin)
  await server.register(AuthorisationPlugin)
  await server.register(RouterPlugin)
  await server.register(HapiPinoPlugin(TestConfig.logInTest))
  await server.register(AirbrakePlugin)
  await server.register(RequestNotifierPlugin)
  await server.register(MissingPayloadPlugin)
  await server.register(InvalidCharactersPlugin)
  await server.register(PayloadCleanerPlugin)
  await server.register(DbErrorsPlugin)
  await server.register(VersionInfoPlugin)
  await server.register(DeprecatedRoutePlugin)
  await server.register(RequestBillRunPlugin)
  // We register the invoice and licence plugins after the bill run plugin as the bill run plugin performs validation
  // that is assumed to be done by the time we get to these plugins
  await server.register(RequestInvoicePlugin)
  await server.register(RequestLicencePlugin)

  // Register non-production plugins
  if (ServerConfig.environment === 'development') {
    await server.register(BlippPlugin)
  }
}

const init = async () => {
  // We use global-agent to seamlessly route requests via a proxy if one is defined in .env. However we do not want
  // this in a test environment as it prevents Nock from successfully intercepting requests.
  if (ServerConfig.environment !== 'test') {
    GlobalAgent.bootstrap()
  }

  // Create the hapi server
  const server = Hapi.server(ServerConfig.hapi)

  // Set default validator (required when adding validation to a route)
  server.validator(Joi)

  await registerPlugins(server)
  await server.initialize()

  return server
}

const start = async () => {
  const server = await init()
  await server.start()

  return server
}

process.on('unhandledRejection', err => {
  console.log(err)
  process.exit(1)
})

module.exports = { init, start }
