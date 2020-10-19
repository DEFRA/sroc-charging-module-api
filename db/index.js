const dbConfig = require('../knexfile')

const db = require('knex')(dbConfig)

module.exports = { db, dbConfig }
