/*
  Plugin to implement authentication. This plugin handles bearer tokens and
  decoding the JWT
*/
const HapiNowAuth = require('@now-ims/hapi-now-auth')

const hapiNowAuth = {
  plugin: HapiNowAuth
}

module.exports = hapiNowAuth
