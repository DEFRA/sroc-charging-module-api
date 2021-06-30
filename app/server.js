import Hapi from '@hapi/hapi'

import AirbrakePlugin from './plugins/airbrake.plugin.js'
import AuthorisationPlugin from './plugins/authorisation.plugin.js'
import BlippPlugin from './plugins/blipp.plugin.js'
import DbErrorsPlugin from './plugins/db_errors.plugin.js'
import HapiNowAuthPlugin from './plugins/hapi_now_auth.plugin.js'
import HapiPinoPlugin from './plugins/hapi_pino.plugin.js'
import InvalidCharactersPlugin from './plugins/invalid_characters.plugin.js'
import JwtAuthOptionsLib from './lib/jwt_auth_options.lib.js'
import MissingPayloadPlugin from './plugins/missing_payload.plugin.js'
import PayloadCleanerPlugin from './plugins/payload_cleaner.plugin.js'
import RequestBillRunPlugin from './plugins/request_bill_run.plugin.js'
import RequestInvoicePlugin from './plugins/request_invoice.plugin.js'
import RequestLicencePlugin from './plugins/request_licence.plugin.js'
import RequestNotifierPlugin from './plugins/request_notifier.plugin.js'
import RouterPlugin from './plugins/router.plugin.js'
import StopPlugin from './plugins/stop.plugin.js'
import VersionInfoPlugin from './plugins/version_info.plugin.js'

import ServerConfig from '../config/server.config.js'
import TestConfig from '../config/test.config.js'

const registerPlugins = async (server) => {
  // Register our auth plugin and then the strategies (needs to be done in this order)
  await server.register(HapiNowAuthPlugin)
  server.auth.strategy('jwt-strategy', 'hapi-now-auth', JwtAuthOptionsLib)
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
  // Create the hapi server
  const server = Hapi.server(ServerConfig.hapi)

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

export { init, start }
