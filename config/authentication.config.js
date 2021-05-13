'use strict'

require('dotenv').config()

const config = {
  environment: process.env.ENVIRONMENT,
  adminClientId: process.env.ADMIN_CLIENT_ID,
  systemClientId: process.env.SYSTEM_CLIENT_ID,
  testClientId: process.env.TEST_CLIENT_ID,
  // Credit to https://stackoverflow.com/a/323546/6117745 for how to handle
  // converting the env var to a boolean
  ignoreJwtExpiration: (String(process.env.IGNORE_JWT_EXPIRATION) === 'true') || false
}

module.exports = config
