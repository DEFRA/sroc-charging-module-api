'use strict'

require('dotenv').config()

const config = {
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  testDatabase: process.env.POSTGRES_DB_TEST
}

module.exports = config
