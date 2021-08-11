'use strict'

/**
 * @module ReportingExportService
 */

const path = require('path')

const ExportTableService = require('./export_table.service')
const SendFileToS3Service = require('./send_file_to_s3.service')

class ReportingExportService {
  /**
   * Exports a set of db tables to an S3 bucket for reporting purposes
   *
   *
   */
  // TODO: confirm where to send (eg. /export/wrls/ ?)
  // TODO: - upload bucket, root folder /csv/
  // TODO: confirm if we also write to the archive bucket? NO
  // TODO: Make sure we abort process if error occurs during _exportTables
  // TODO: confirm whether we continue uploading files if an error occurs during an upload? YES WE DO
  // TODO: look to see if we can specify multiple files to upload in the s3 extension? [but one for another pr if too complex]
  static async go (notifier) {
    const tables = this._tablesToExport()
    const exportedTables = await this._exportTables(tables, notifier)
    await this._uploadTables(exportedTables, notifier)
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
   * exported files with their full path and filename.
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
    }
  }

  static async _uploadTables (files) {
    for (const file of files) {
      const key = this._determineKey(file)
      await SendFileToS3Service.go(file, key)
    }
  }

  /**
   * The key in the S3 bucket is the remote path plus the filename. We assemble this by extracting the filename from the
   * passed-in local file+path and appending it to our desired remote path.
   */
  static _determineKey (file) {
    const remotePath = 'wrls'
    const filename = path.basename(file)
    return path.join(remotePath, filename)
  }
}

module.exports = ReportingExportService
