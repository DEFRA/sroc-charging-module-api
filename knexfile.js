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

const development = {
  connection: {
    host: DatabaseConfig.host,
    user: DatabaseConfig.user,
    password: DatabaseConfig.password,
    database: DatabaseConfig.database,
    port: DatabaseConfig.port,
    charset: 'utf8'
  },
  ...defaultConfig
}

const test = {
  connection: {
    host: DatabaseConfig.host,
    user: DatabaseConfig.user,
    password: DatabaseConfig.password,
    database: DatabaseConfig.testDatabase,
    port: DatabaseConfig.port,
    charset: 'utf8'
  },
  ...defaultConfig
}

const production = {
  connection: {
    host: DatabaseConfig.host,
    user: DatabaseConfig.user,
    password: DatabaseConfig.password,
    database: DatabaseConfig.database,
    port: DatabaseConfig.port,
    charset: 'utf8'
  },
  ...defaultConfig
}

module.exports = { development, test, production }
