'use strict'

const { db, dbConfig } = require('./db')

const DatabaseHelper = require('../test/support/helpers/database.helper')

const clean = async () => {
  try {
    await DatabaseHelper.clean()
  } catch (error) {
    console.error(`Could not clean ${dbConfig.connection.database}: ${error.message}`)
  } finally {
    // Kill the connection after running the command else the terminal will appear to hang
    await db.destroy()
  }
}

clean()
