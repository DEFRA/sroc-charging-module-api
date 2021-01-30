'use strict'

const { ServerConfig } = require('../../config')

const AirbrakePlugin = require('./airbrake.plugin')
const AuthorisationPlugin = require('./authorisation.plugin')
const DbErrorsPlugin = require('./db_errors.plugin')
const HapiNowAuthPlugin = require('./hapi_now_auth.plugin')
const HapiPinoPlugin = require('./hapi_pino.plugin')
const InvalidCharactersPlugin = require('./invalid_characters.plugin')
const MissingPayloadPlugin = require('./missing_payload.plugin')
const PayloadCleanerPlugin = require('./payload_cleaner.plugin')
const RouterPlugin = require('./router.plugin')
const StopPlugin = require('./stop.plugin')

// These plugins are only used when the app is running in NODE_ENV=development. This means we don't want them or their
// dependencies available in production. The problem is when we build the image any dev dependencies won't be installed.
// Even though we won't register the plugins, just calling `require()` on the plugin file will cause an error because
// it will be looking for those missing packages.
//
// So along with the check in server.js to not register dev plugins we also need a check here to avoid require() them.
let BlippPlugin
let HpalDebugPlugin

if (ServerConfig.environment === 'development') {
  BlippPlugin = require('./blipp.plugin')
  HpalDebugPlugin = require('./hpal_debug.plugin')
}

module.exports = {
  AirbrakePlugin,
  AuthorisationPlugin,
  BlippPlugin,
  DbErrorsPlugin,
  HpalDebugPlugin,
  HapiNowAuthPlugin,
  HapiPinoPlugin,
  InvalidCharactersPlugin,
  MissingPayloadPlugin,
  PayloadCleanerPlugin,
  RouterPlugin,
  StopPlugin
}
