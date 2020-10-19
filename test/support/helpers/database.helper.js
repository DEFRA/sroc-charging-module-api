const authConfig = require('../../../config/authentication.config')
const { db, dbConfig } = require('../../../db')
const { AuthorisedSystemModel } = require('../../../app/models')

class DatabaseHelper {
  static async clean () {
    const tables = await this._tableNames()
    return await db.raw(`TRUNCATE TABLE "${tables.join('","')}" RESTART IDENTITY`)
  }

  static async addAdminUser (id) {
    const systemId = id || authConfig.adminClientId

    await AuthorisedSystemModel
      .query()
      .insert({
        id: systemId,
        name: 'admin',
        admin: true,
        status: 'active'
      })
      .returning('*')
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
