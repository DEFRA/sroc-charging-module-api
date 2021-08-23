'use strict'

/**
 * @module ExportTableService
 */

const TransformTableToFileService = require('../transform_table_to_file.service')

const { db } = require('../../../../db')

class ExportTableToFileService {
  /**
   * Writes the content of a database table to a file in CSV format.
   *
   * We use `TransformRecordsToFileService` to do this, passing in the following parameters:
   * - A knex QueryBuilder object which will select everything in the table when the query is executed;
   * - The column names, obtained using the knex columnInfo() method;
   * - The filename, which is the table name with `.dat` appended.
   *
   * `TransformTableToFileService` returns the path and filename of the exported file, which we pass back to the service
   * that called us.
   *
   * @param {string} table The name of the table to be exported
   * @returns {string} The full path and filename of the exported file
   */
  static async go (table) {
    return TransformTableToFileService.go(
      this._query(table),
      await this._columnNames(table),
      this._filename(table)
    )
  }

  static _query (table) {
    return db
      .from(table)
      .select('*')
  }

  static async _columnNames (table) {
    const columnInfo = await db
      .from(table)
      .columnInfo()

    return Object.keys(columnInfo)
  }

  static _filename (table) {
    return `${table}.csv`
  }
}

module.exports = ExportTableToFileService
