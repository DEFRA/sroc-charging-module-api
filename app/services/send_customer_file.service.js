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
   * - Calls GenerateCustomerFileService to generate the customer file;
   * - Calls SendFileToS3Service to send the customer file to the S3 bucket;
   * - Deletes the customer records for the regime and region from the db;
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

        generatedFile = await this._generateAndSend(regime, region)

        await this._clearCustomerTable(regime, region)

        if (this._removeTemporaryFiles()) {
          await DeleteFileService.go(generatedFile)
        }
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
   * Generate and send the customer file. Returns the path and filename of the generated file.
   */
  static async _generateAndSend (regime, region) {
    const fileReference = await this._fileReference(regime, region)
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
