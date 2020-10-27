'use strict'

require('dotenv').config()

const config = {
  // Credit to https://stackoverflow.com/a/323546/6117745 for how to handle
  // converting the env var to a boolean
  logInTest: (String(process.env.LOG_IN_TEST) === 'true') || false
}

module.exports = config
