'use strict'

/**
 * @module ReportingExportService
 */

const path = require('path')

const ExportTableService = require('./export_table.service')
const SendFileToS3Service = require('./send_file_to_s3.service')

class DataExportService {
  /**
   * Exports a set of db tables in CSV format to an S3 bucket.
   *
   * When called it will attempt to export the tables to CSV files. If any one of these fails to export, an error will
   * be logged using notifier, the process will stop, and the service will return `false`.
   *
   * Once the tables are exported, it will then attempt to send them to an S3 bucket (in the /csv/ 'folder'). If any
   * file fails to send, an error will be logged using notifier, the process will continue, and once complete the
   * service will return `false`. If all files are sent successfully then the service will return `true`.
   *
   * @param {@module:RequestNotifierLib} notifier Instance of `RequestNotifierLib` class. We use it to log errors rather
   * than throwing them as this service is intended to run in the background.
   * @returns {Boolean} Returns `true` if exporting and sending all files succeeded, or `false` if exporting failed or
   * sending at least one file failed.
   */
  static async go (notifier) {
    let exportedTables

    try {
      const tables = this._tablesToExport()
      exportedTables = await this._exportTables(tables, notifier)
      const sendSuccess = await this._sendFiles(exportedTables, notifier)

      return sendSuccess
    } catch (error) {
      return false
    }
  }

  static _tablesToExport () {
    return [
      'authorised_systems',
      'bill_runs',
      'customer_files',
      'exported_customers',
      'invoices',
      'licences',
      'regimes',
      'transactions'
    ]
  }

  /**
   * Iterates over an array of table names and exports each one to the local temp folder, returning an array of the
   * exported files with their full path and filename. If exporting a table fails then an error will be logged with
   * notifier, and an error will be thrown to halt the process.
   */
  static async _exportTables (tables, notifier) {
    let table

    try {
      const files = []

      for (table of tables) {
        const file = await ExportTableService.go(table)
        files.push(file)
      }

      return files
    } catch (error) {
      notifier.omfg(
        `Error exporting table ${table}`,
        { table, error }
      )

      // Throw an error to signal to the caller that we failed
      throw error
    }
  }

  /**
   * Receives an array of filenames and sends the files to the S3 bucket. If sending a file fails then an error will be
   * logged with notifier and it will continue to send the remaining files.
   */
  static async _sendFiles (files, notifier) {
    let success = true

    for (const file of files) {
      try {
        const key = this._determineKey(file)
        await SendFileToS3Service.go(file, key, false)
      } catch (error) {
        notifier.omfg(
          `Error sending file ${file}`,
          { file, error }
        )

        success = false
      }
    }

    return success
  }

  /**
   * The key in the S3 bucket is the remote path plus the filename (ie. csv/authorised_systems.csv). We assemble this by
   * extracting the filename from the passed-in local file+path and appending it to our desired remote path.
   */
  static _determineKey (file) {
    const remotePath = 'csv'
    const filename = path.basename(file)

    return path.join(remotePath, filename)
  }
}

module.exports = DataExportService
