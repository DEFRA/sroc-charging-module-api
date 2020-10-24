'use strict'

const AirbrakePlugin = require('./airbrake.plugin')
const BlippPlugin = require('./blipp.plugin')
const DisinfectPlugin = require('./disinfect.plugin')
const HapiNowAuthPlugin = require('./hapi_now_auth.plugin')
const HpalDebugPlugin = require('./hpal_debug.plugin')
const RouterPlugin = require('./router.plugin')
const UnescapePlugin = require('./unescape.plugin')

module.exports = {
  AirbrakePlugin,
  BlippPlugin,
  DisinfectPlugin,
  HapiNowAuthPlugin,
  HpalDebugPlugin,
  RouterPlugin,
  UnescapePlugin
}
