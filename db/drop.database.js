const environment = process.env.NODE_ENV || 'development'

const dbConfig = require('../knexfile')[environment]

const databaseName = dbConfig.connection.database

// Connect to maintenance database. We can't use `knexfile.js` and require it as we would in other places because it
// will already have instantiated using the actual DB. And we don't want to connect to the main DB because you cannot
// drop a DB with active connections!
// So we have to grab our config and instantiate it ourselves here so we can connect against the default 'postgres' DB.
// https://stackoverflow.com/a/31428260/6117745
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: dbConfig.connection.host,
    port: dbConfig.connection.port,
    user: dbConfig.connection.user,
    password: dbConfig.connection.password,
    database: 'postgres',
    charset: 'utf8'
  }
})

const up = async function (knex) {
  try {
    // We'll get errors if we try to drop the db when there are active connections. So, we use this command first to
    // drop any active connections it finds.
    // https://www.postgresqltutorial.com/postgresql-drop-database/
    console.log(`Dropping active connections to ${databaseName}`)
    await knex.raw(`SELECT pg_terminate_backend (pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${databaseName}'`)

    await knex.raw(`DROP DATABASE IF EXISTS ${databaseName}`)
    console.log(`Successfully dropped ${databaseName}`)
  } catch (error) {
    console.error(`Could not drop ${databaseName}: ${error.message}`)
  } finally {
    // Kill the connection after running the command else the terminal will
    // appear to hang
    await knex.destroy()
  }
}

up(knex)
