'use strict'

const DatabaseConfig = require('./config/database.config')

const defaultConfig = {
  client: 'postgres',
  useNullAsDefault: true,
  migrations: {
    tableName: 'knex_migrations',
    directory: './db/migrations'
  },
  seeds: {
    directory: './db/seeds'
  }
}

const defaultConnection = {
  host: DatabaseConfig.host,
  user: DatabaseConfig.user,
  password: DatabaseConfig.password,
  database: DatabaseConfig.database,
  port: DatabaseConfig.port,
  charset: 'utf8'
}

const development = {
  ...defaultConfig,
  connection: {
    ...defaultConnection
  }
}

const test = {
  ...defaultConfig,
  connection: {
    ...defaultConnection,
    database: DatabaseConfig.testDatabase
  }
}

const production = {
  ...defaultConfig,
  connection: {
    ...defaultConnection
  }
}

module.exports = { development, test, production }
