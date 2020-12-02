'use strict'

const environment = process.env.NODE_ENV || 'development'

const dbConfig = require('../knexfile')[environment]

const databaseName = dbConfig.connection.database

// Connect to maintenance database. We can't use `knexfile.js` and require it as we would in other places because it
// will already have instantiated using the actual db.
// So we have to grab our config and instantiate it ourselves here so we can connect against the default 'postgres' db.
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
