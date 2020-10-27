'use strict'

const AirbrakeConfig = require('./airbrake.config')
const AuthenticationConfig = require('./authentication.config')
const DatabaseConfig = require('./database.config')
const RulesServiceConfig = require('./rules_service.config')
const ServerConfig = require('./server.config')
const TestConfig = require('./test.config')

module.exports = {
  AirbrakeConfig,
  AuthenticationConfig,
  DatabaseConfig,
  RulesServiceConfig,
  ServerConfig,
  TestConfig
}
