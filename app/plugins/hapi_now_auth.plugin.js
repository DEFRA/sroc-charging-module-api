'use strict'

/**
 * Plugin to implement authentication. This plugin handles bearer tokens and decoding the JWT
 *
 * {@link https://github.com/now-ims/hapi-now-auth}
 * {@link https://jwt.io/}
 *
 * @module HapiNowAuthPlugin
 */

const HapiNowAuth = require('@now-ims/hapi-now-auth')

const HapiNowAuthPlugin = {
  plugin: HapiNowAuth
}

module.exports = HapiNowAuthPlugin
