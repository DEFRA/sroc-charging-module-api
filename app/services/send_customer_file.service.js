'use strict'

/**
 * @module SendCustomerFileService
 */

const path = require('path')

const { ServerConfig } = require('../../config')
const { removeTemporaryFiles } = ServerConfig

const { CustomerFileModel, CustomerModel } = require('../../app/models')

const GenerateCustomerFileService = require('./generate_customer_file.service')
const MoveCustomersToExportedTableService = require('./move_customers_to_exported_table.service')
const SendFileToS3Service = require('./send_file_to_s3.service')
const DeleteFileService = require('./delete_file.service')
const NextCustomerFileReferenceService = require('./next_customer_file_reference.service')

class SendCustomerFileService {
  /**
   * Organises the generation and sending of a customer file.
   *
   * The service accepts an array of regions. It is expected that when it is called during the "send bill run" process
   * we will receive an array containing just the region of the bill run, and an array will only be passed to it by the
   * automated once-a-week "send all customer files" process.
   *
   * For each given region it:
   * - Checks if a file is needed (ie. if there are any customer changes in the db for the given regime and region);
   * - Creates an appropriate entry in the customer_files table and sets the status to `pending`;
   * - Calls GenerateCustomerFileService to generate the customer file;
   * - Calls SendFileToS3Service to send the customer file to the S3 bucket;
   * - Deletes the customer records for the regime and region from the db;
   * - Sets the customer_files record status to `exported` and exportedDate to the current date;
   * - Deletes the file if ServerConfig.removeTemporaryFiles is set to `true`.
   *
   * @param {module:RegimeModel} regime The regime that the customer file is to be generated for.
   * @param {array} regions An arry of regions we want to send a customer file for.
   * @param {@module:Notifier} notifier Instance of `Notifier` class. We use it to log errors rather than throwing them
   * as this service is intended to run in the background.
   */
  static async go (regime, regions, notifier) {
    let generatedFile

    for (const region of regions) {
      try {
        const fileNeeded = await this._checkIfFileNeeded(regime, region)
        if (!fileNeeded) {
          // No file is needed for this region so continue to the next region
          continue
        }

        const fileReference = await this._fileReference(regime, region)

        const customerFile = await this._createCustomerFile(regime.id, region, fileReference)

        await this._setPendingStatus(customerFile)

        generatedFile = await this._generateAndSend(regime, region, fileReference)

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
   * Returns true if there are customer records for this regime and region, or false if there aren't
   */
  static async _checkIfFileNeeded (regime, region) {
    const customers = await CustomerModel.query()
      .select('id')
      .where('regimeId', regime.id)
      .where('region', region)

    return customers.length !== 0
  }

  /**
   * Creates and returns a record in the customer_file table
   */
  static async _createCustomerFile (regimeId, region, fileReference) {
    return CustomerFileModel.query().insert({
      regimeId,
      region,
      fileReference
    })
  }

  /**
   * Sets the status of a customer file to 'pending'
   */
  static async _setPendingStatus (customerFile) {
    await customerFile.$query()
      .patch({ status: 'pending' })
  }

  /**
   * Sets the status of a customer file to 'exported' and sets exportedAt to the current date
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
  static async _generateAndSend (regime, region, fileReference) {
    const filename = this._filename(fileReference)

    const generatedFile = await GenerateCustomerFileService.go(regime.id, region, filename, fileReference)

    // The key is the remote path and filename in the S3 bucket, eg. 'wrls/customer/nalac50001.dat'
    const key = path.join(regime.slug, 'customer', filename)

    await SendFileToS3Service.go(generatedFile, key)

    return generatedFile
  }

  /**
   * Obtains a file reference for the given regime and region and returns the resulting filename
   */
  static async _fileReference (regime, region) {
    return NextCustomerFileReferenceService.go(regime, region)
  }

  static _filename (fileReference) {
    return `${fileReference}.dat`
  }

  /**
   * Returns the state of the `removeTemporaryFiles` config setting. Kept in a separate method for ease of testing.
   */
  static _removeTemporaryFiles () {
    return removeTemporaryFiles
  }
}

module.exports = SendCustomerFileService
