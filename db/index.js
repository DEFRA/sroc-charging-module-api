'use strict'

const environment = process.env.NODE_ENV || 'development'

const dbConfig = require('../knexfile')[environment]

// Some of our db fields are of type BigInt. The 'pg' driver by default will return these as strings because of concerns
// about precision loss (a pg BigInt has a bigger range than a JavaScript integer). However, a JavaScript integer has
// a range of -9007199254740991 to 9007199254740991. This is well, well within the bounds of what we need (assuming
// we won't generate a bill for more than the national debt of the UK!).
// So to avoid having to deal with converting strings to BigInt in our code we can tell the pg driver to parse BigInt's
// as integers instead. See the following for more details about both the issue and this config change
// https://github.com/brianc/node-postgres/pull/353
// https://github.com/knex/knex/issues/387#issuecomment-51554522
const pg = require('pg')
// The magic number 20 comes from `SELECT oid FROM pg_type WHERE typname = 'int8';` and is unlikely to change.
pg.types.setTypeParser(20, 'text', parseInt)

const db = require('knex')(dbConfig)

module.exports = { db, dbConfig }
