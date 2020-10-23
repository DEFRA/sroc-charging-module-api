'use strict'

require('dotenv').config()

const config = {
  port: process.env.PORT,
  // The routes section is used to set default configuration for every route
  // in the app. In our case we want to Hapi to set a bunch of common security
  // heades. See https://hapi.dev/api/?v=20.0.0#-routeoptionssecurity for
  // details of what gets enabled
  routes: {
    security: true
  }
}

module.exports = config
