'use strict'

const environment = process.env.NODE_ENV || 'development'

const dbConfig = require('../knexfile')[environment]

const db = require('knex')(dbConfig)

module.exports = { db, dbConfig }
