'use strict'

const DatabaseConfig = require('../config/database.config')

// If the script has been run using the package.json scripts the database name
// will be set as `sroc_charge` or `sroc_charge_test`. This is done by
// overriding the PGDATABASE env var set in .env (or the current environment).
const databaseName = DatabaseConfig.database

// connect to maintenance database
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: DatabaseConfig.host,
    port: DatabaseConfig.port,
    user: DatabaseConfig.user,
    password: DatabaseConfig.password,
    database: 'postgres',
    charset: 'utf8'
  }
})

const up = async function (knex) {
  try {
    await knex.raw(`CREATE DATABASE ${databaseName}`)
    console.log(`Successfully created ${databaseName}`)
  } catch (error) {
    console.error(`Could not create ${databaseName}: ${error.message}`)
  } finally {
    // Kill the connection after running the command else the terminal will
    // appear to hang
    await knex.destroy()
  }
}

up(knex)
