'use strict'

const { ServerConfig } = require('../../config')

const AirbrakePlugin = require('./airbrake.plugin')
const AuthorisationPlugin = require('./authorisation.plugin')
const DbErrorsPlugin = require('./db_errors.plugin')
const DeprecatedRoutePlugin = require('./deprecated_route.plugin')
const HapiNowAuthPlugin = require('./hapi_now_auth.plugin')
const HapiPinoPlugin = require('./hapi_pino.plugin')
const InvalidCharactersPlugin = require('./invalid_characters.plugin')
const MissingPayloadPlugin = require('./missing_payload.plugin')
const PayloadCleanerPlugin = require('./payload_cleaner.plugin')
const RequestBillRunPlugin = require('./request_bill_run.plugin')
const RequestInvoicePlugin = require('./request_invoice.plugin')
const RequestLicencePlugin = require('./request_licence.plugin')
const RequestNotifierPlugin = require('./request_notifier.plugin')
const RouterPlugin = require('./router.plugin')
const StopPlugin = require('./stop.plugin')
const VersionInfoPlugin = require('./version_info.plugin')

// These plugins are only used when the app is running in NODE_ENV=development. This means we don't want them or their
// dependencies available in production. The problem is when we build the image any dev dependencies won't be installed.
// Even though we won't register the plugins, just calling `require()` on the plugin file will cause an error because
// it will be looking for those missing packages.
//
// So along with the check in server.js to not register dev plugins we also need a check here to avoid require() them.
let BlippPlugin

if (ServerConfig.environment === 'development') {
  BlippPlugin = require('./blipp.plugin')
}

module.exports = {
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
  RequestNotifierPlugin,
  RequestInvoicePlugin,
  RequestLicencePlugin,
  RouterPlugin,
  StopPlugin,
  VersionInfoPlugin
}
