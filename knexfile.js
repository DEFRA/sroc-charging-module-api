const DatabaseConfig = require('./config/database.config')

module.exports = {
  client: 'postgres',
  connection: {
    host: DatabaseConfig.host,
    user: DatabaseConfig.user,
    password: DatabaseConfig.password,
    database: DatabaseConfig.database,
    port: DatabaseConfig.port,
    charset: 'utf8'
  },
  useNullAsDefault: true,
  migrations: {
    tableName: 'knex_migrations',
    directory: './db/migrations'
  },
  seeds: {
    directory: './db/seeds'
  }
}
