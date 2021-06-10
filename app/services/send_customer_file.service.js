'use strict'

/**
 * @module SendCustomerFileService
 */

const path = require('path')

const { ServerConfig } = require('../../config')
const { removeTemporaryFiles } = ServerConfig

const { CustomerFileModel } = require('../../app/models')

const DeleteFileService = require('./delete_file.service')
const GenerateCustomerFileService = require('./generate_customer_file.service')
const MoveCustomersToExportedTableService = require('./move_customers_to_exported_table.service')
const PrepareCustomerFileService = require('./prepare_customer_file.service')
const SendFileToS3Service = require('./send_file_to_s3.service')

class SendCustomerFileService {
  /**
   * Orchestrates the generation and sending of customer files to SSCL.
   *
   * The service accepts an array of regions. It is expected that when it is called during the "send bill run" process
   * we will receive an array containing just the region of the bill run, and an array will only be passed to it by the
   * automated once-a-week "send all customer files" process.
   *
   * For each given region it:
   * - Checks for any unprocessed customer changes in the `customers` table
   * - If there are, creates a `customer_file` record with a status of 'pending' and links it to the changes
   *
   * It then iterates through all pending `customer_file` records and:
   * - Calls GenerateCustomerFileService to generate the customer file
   * - Calls SendFileToS3Service to send the customer file to the S3 bucket
   * - Deletes the linked customer change records
   * - Sets the `customer_file`s record status to `exported` and `exportedDate` to the current date;
   * - Deletes the file if `ServerConfig.removeTemporaryFiles` is set to `true`.
   *
   * @param {module:RegimeModel} regime The regime that the customer file is to be generated for.
   * @param {array} regions An arry of regions we want to send a customer file for.
   * @param {@module:RequestNotifierLib} notifier Instance of `RequestNotifierLib` class. We use it to log errors rather
   * than throwing them as this service is intended to run in the background.
   */
  static async go (regime, regions, notifier) {
    for (const region of regions) {
      const preparedFiles = await this._prepareFiles(regime, region, notifier)
      await this._processPreparedFiles(preparedFiles, regime, region, notifier)
    }
  }

  /**
   * Calls PrepareCustomerFileService for the given regime and region and if there are customer changes it handles
   * creating the 'customer file' record and linking it to them
   */
  static async _prepareFiles (regime, region, notifier) {
    try {
      await PrepareCustomerFileService.go(regime, region)
    } catch (error) {
      notifier.omfg(
        `Error preparing customer file for ${regime.slug} ${region}`,
        { regime: regime.slug, region, error }
      )
    }

    // We return the query regardless of whether the try/catch fails to ensure that even if it does fail, we still
    // return any `pending` files that already exist, or an empty array if there are none.
    return CustomerFileModel.query()
      .select('id', 'region', 'fileReference')
      .where('status', 'pending')
      .andWhere('regimeId', regime.id)
      .andWhere('region', region)
  }

  /**
   * Given an array of `customer files` it iterates through them, generating the file, sending it to S3 and recording
   * the result
   *
   * Specifically it
   *
   * - Generates the file
   * - Send it to the S3 uploads bucket
   * - Sends a copy to the S3 archive bucket
   * - Moves the customer change records to the exported_customers table;
   * - Sets the 'customer file' status to `exported` along with the export date
   * - Deletes the temp file (if configured to)
   */
  static async _processPreparedFiles (preparedFiles, regime, region, notifier) {
    for (const customerFile of preparedFiles) {
      let generatedFile

      try {
        generatedFile = await this._generateAndSend(regime, customerFile)

        await MoveCustomersToExportedTableService.go(regime, region, customerFile.id)

        await this._setExportedStatusAndDate(customerFile)

        if (this._removeTemporaryFiles()) {
          await DeleteFileService.go(generatedFile)
        }

        notifier.omg('Completed sending customer file', { regime: regime.slug, region, generatedFile })
      } catch (error) {
        notifier.omfg(
          `Error sending customer file for ${regime.slug} ${region}`,
          { regime: regime.slug, region, generatedFile, error }
        )
      }
    }
  }

  /**
   * Sets the status of a customer file to 'exported' and sets exportedAt to the current date time
   */
  static async _setExportedStatusAndDate (customerFile) {
    await customerFile.$query()
      .patch({
        status: 'exported',
        exportedAt: new Date()
      })
  }

  /**
   * Generate and send the customer file. Returns the path and filename of the generated file.
   */
  static async _generateAndSend (regime, customerFile) {
    const generatedFile = await GenerateCustomerFileService.go(customerFile)
    const filename = path.basename(generatedFile)

    // The key is the remote path and filename in the S3 bucket, eg. 'wrls/customer/nalac50001.dat'
    const key = path.join(regime.slug, 'customer', filename)

    await SendFileToS3Service.go(generatedFile, key)

    return generatedFile
  }

  /**
   * Returns the state of the `removeTemporaryFiles` config setting. Kept in a separate method for ease of testing.
   */
  static _removeTemporaryFiles () {
    return removeTemporaryFiles
  }
}

module.exports = SendCustomerFileService
