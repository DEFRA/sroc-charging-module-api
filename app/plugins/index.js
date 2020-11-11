'use strict'

const AirbrakePlugin = require('./airbrake.plugin')
const AuthorisationPlugin = require('./authorisation.plugin')
const BlippPlugin = require('./blipp.plugin')
const DisinfectPlugin = require('./disinfect.plugin')
const HpalDebugPlugin = require('./hpal_debug.plugin')
const HapiNowAuthPlugin = require('./hapi_now_auth.plugin')
const HapiPinoPlugin = require('./hapi_pino.plugin')
const InvalidCharactersPlugin = require('./invalid_characters.plugin')
const MissingPayloadPlugin = require('./missing_payload.plugin')
const RouterPlugin = require('./router.plugin')
const UnescapePlugin = require('./unescape.plugin')

module.exports = {
  AirbrakePlugin,
  AuthorisationPlugin,
  BlippPlugin,
  DisinfectPlugin,
  HpalDebugPlugin,
  HapiNowAuthPlugin,
  HapiPinoPlugin,
  InvalidCharactersPlugin,
  MissingPayloadPlugin,
  RouterPlugin,
  UnescapePlugin
}
