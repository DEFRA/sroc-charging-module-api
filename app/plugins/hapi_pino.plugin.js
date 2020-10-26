'use strict'

/**
 * Plugin that handles logging for the application
 *
 * {@link https://github.com/pinojs/hapi-pino|hapi-pino} wraps the
 * {@link https://github.com/pinojs/pino#low-overhead|pino} Node JSON logger as a logger for Hapi. We pretty much use it
 * as provided with its defaults.
 *
 * @module HapiPinoPlugin
 */
const HapiPino = require('hapi-pino')

const HapiPinoPlugin = {
  plugin: HapiPino,
  options: {
    // When not in the production environment we want a 'pretty' version of the JSON to make it easier to grok what has
    // happened
    prettyPrint: process.env.NODE_ENV !== 'production',
    // Redact Authorization headers, see https://getpino.io/#/docs/redaction
    redact: ['req.headers.authorization'],
    // We don't want logs outputting for our 'health' routes
    ignorePaths: ['/', '/status']
  }
}

module.exports = HapiPinoPlugin
