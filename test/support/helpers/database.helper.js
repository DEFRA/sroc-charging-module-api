'use strict'

const { db, dbConfig } = require('../../../db/index')

/**
 * Use to help with cleaning the database between tests
 *
 * It's good practise to ensure the database is in a 'clean' state between tests to avoid any side effects caused by
 * data from one test being present in another.
 */
class DatabaseHelper {
  /**
   * Call to clean the database of all data
   *
   * It works by identifying all the tables in the public schema (which we use). It then works out what the migration
   * tables are called because those we should not be touching.
   *
   * Once it has that info it creates a query that tells PostgreSQL to TRUNCATE all the tables and restart their
   * identity columns. For example, if a table relies on an incrementing ID the query will reset that to 1.
   */
  static async clean () {
    const tables = await this._tableNames()
    return await db.raw(`TRUNCATE TABLE "${tables.join('","')}" RESTART IDENTITY`)
  }

  static _migrationTables () {
    return [dbConfig.migrations.tableName, `${dbConfig.migrations.tableName}_lock`]
  }

  static async _tableNames () {
    const result = await db('pg_tables')
      .select('tablename')
      .where('schemaname', 'public')
      .whereNotIn('tablename', this._migrationTables())

    return result.map((table) => table.tablename)
  }
}

module.exports = DatabaseHelper
