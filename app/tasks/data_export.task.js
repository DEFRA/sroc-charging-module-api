'use strict'

/**
 * @module DataExportTask
 */

const { ExportDataFiles } = require('../services')

class DataExportTask {
  /**
   * Trigger export of all relevant data tables to CSV and then upload them to S3
   *
   * Intended to be called as a scheduled task from Jenkins using a package.json script and via `TaskRunner`.
   *
   * @param {@module:BaseNotifierLib} notifier Instance of a `Notifier` class. Expected to be an instance of
   * `TaskNotifierLib` but anything that implements `BaseNotifierLib` is supported.
   */
  static async go (notifier) {
    notifier.omg('Starting data export task')

    await ExportDataFiles.go(notifier)

    notifier.omg('Finished data export task')
  }
}

module.exports = DataExportTask
