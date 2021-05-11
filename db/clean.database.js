'use strict'

const { db, dbConfig } = require('./index')

const clean = async () => {
  try {
    const migrationTables = [dbConfig.migrations.tableName, `${dbConfig.migrations.tableName}_lock`]

    const result = await db('pg_tables')
      .select('tablename')
      .where('schemaname', 'public')
      .whereNotIn('tablename', migrationTables)

    const tables = result.map((table) => table.tablename)

    await db.raw(`TRUNCATE TABLE "${tables.join('","')}" RESTART IDENTITY`)
  } catch (error) {
    console.error(`Could not clean ${dbConfig.connection.database}: ${error.message}`)
  } finally {
    // Kill the connection after running the command else the terminal will appear to hang
    await db.destroy()
  }
}

clean()
