'use strict'

const environment = process.env.NODE_ENV || 'development'

const dbConfig = require('../knexfile')[environment]

const pg = require('pg')
pg.types.setTypeParser(20, 'text', parseInt)

const db = require('knex')(dbConfig)

module.exports = { db, dbConfig }
