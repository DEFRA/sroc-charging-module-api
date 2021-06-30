import DatabaseConfig from './config/database.config.js'

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

export { development, test, production }
