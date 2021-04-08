'use strict'

/**
 * @module SendCustomerFileService
 */

const path = require('path')

const { ServerConfig } = require('../../config')
const { removeTemporaryFiles } = ServerConfig

const { CustomerModel } = require('../../app/models')

const GenerateCustomerFileService = require('./generate_customer_file.service')
const SendFileToS3Service = require('./send_file_to_s3.service')
const DeleteFileService = require('./delete_file.service')

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
   * - Calls GenerateCustomerFileService to generate the customer file;
   * - Calls SendFileToS3Service to send the customer file to the S3 bucket;
   * - Deletes the customer records for the regime and region from the db;
   * - Deletes the file if ServerConfig.removeTemporaryFiles is set to `true`.
   *
   * @param {module:RegimeModel} regime The regime that the customer file is to be generated for.
   * @param {array} regions An arry of regions we want to send a customer file for.
   * @param {@module:Notifier} [notifier] Instance of `Notifier` class. Used to report any errors that occur.
   */
  static async go (regime, regions, notifier) {
    let generatedFile

    for (const region of regions) {
      try {
        const fileNeeded = await this._checkIfFileNeeded(regime, region)
        if (!fileNeeded) {
          // No file is needed for this region so break and move on to the next region
          break
        }

        generatedFile = await this._generateAndSend(regime, region)

        // Clean up
        await this._clearCustomerTable(regime, region)
        if (this._removeTemporaryFiles()) {
          await DeleteFileService.go(generatedFile)
        }
      } catch (error) {
        notifier.omfg('Error sending customer file', { generatedFile, error })
      }
    }
  }

  /**
   * Returns true if there are customer records for this regime and region, and false if there aren't
   */
  static async _checkIfFileNeeded (regime, region) {
    const customers = await CustomerModel.query()
      .select('id')
      .where('regimeId', regime.id)
      .where('region', region)

    return customers.length !== 0
  }

  /**
   * Generate and send the customer file. Returns the path and filename of the generated file.
   */
  static async _generateAndSend (regime, region) {
    const filename = this._filename()
    const generatedFile = await GenerateCustomerFileService.go(regime, region, filename)

    // The key is the remote path and filename in the S3 bucket, eg. 'wrls/customer/nalac50001.dat'
    const key = path.join(regime.slug, 'customer', filename)

    await SendFileToS3Service.go(generatedFile, key)

    return generatedFile
  }

  static _filename () {
    // TODO: Confirm how filename is generated
    return 'nalac50001.dat'
  }

  static _removeTemporaryFiles () {
    return removeTemporaryFiles
  }

  /**
   * Deletes customer records for the given regime and region
   */
  static async _clearCustomerTable (regime, region) {
    await CustomerModel.query()
      .where('regimeId', regime.id)
      .where('region', region)
      .delete()
  }
}

module.exports = SendCustomerFileService
