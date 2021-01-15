'use strict'

const { knexSnakeCaseMappers } = require('objection')
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
  },
  /**
   * Passing in `knexSnakeCaseMappers` allows us to use camelCase everywhere and knex will convert it to snake_case on
   * the fly.
   *
   * We set the `underscoreBeforeDigits` option so that properties like lineAttr1 are correctly changed to line_attr_1.
   *
   * This means when we access a property on the model we can use camelCase even if the underlying database property
   * was snake_case. It also means we get camelCase object keys, handy when you need to return a db query result as is
   * in a response.
   *
   * @see {@link https://vincit.github.io/objection.js/recipes/snake-case-to-camel-case-conversion.html}
   */
  ...knexSnakeCaseMappers({ underscoreBeforeDigits: true })
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
  connection: defaultConnection
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
  connection: defaultConnection
}

module.exports = { development, test, production }
