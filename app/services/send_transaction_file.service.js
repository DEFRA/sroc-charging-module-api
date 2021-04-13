'use strict'

/**
 * @module SendTransactionFileService
 */

const path = require('path')

const { ServerConfig } = require('../../config')
const { removeTemporaryFiles } = ServerConfig

const GenerateTransactionFileService = require('./generate_transaction_file.service')
const SendFileToS3Service = require('./send_file_to_s3.service')
const DeleteFileService = require('./delete_file.service')

class SendTransactionFileService {
  /**
   * Organises the generation and sending of a transaction file:
   * - Validates that the bill run is in the requisite state;
   * - Checks that a transaction file is required;
   * - Calls GenerateTransactionFileService to generate the transaction file;
   * - Calls SendFileToS3Service to send the transaction file to the S3 bucket;
   * - Deletes the file if ServerConfig.removeTemporaryFiles is set to `true`;
   * - Sets the bill run status to 'billed' if everything was successful.
   *
   * @param {module:RegimeModel} regime The regime that the bill run belongs to. The regime slug will form part of the
   * path we upload to.
   * @param {module:BillRunModel} billRun The bill run we want to send the transaction file for.
   * @param {@module:Notifier} notifier Instance of `Notifier` class. We use it to log errors rather than throwing them
   * as this service is intended to run in the background.
   */
  static async go (regime, billRun, notifier) {
    let generatedFile

    try {
      this._validate(billRun)

      // If we don't need to generate a file then set the bill status to 'billing_not_required' and return early.
      const fileNeeded = this._checkIfFileNeeded(billRun)
      if (!fileNeeded) {
        await this._setBillingNotRequiredStatus(billRun)
        return
      }

      generatedFile = await this._generateAndSend(billRun, regime)
      await this._setBilledStatus(billRun)

      // We delete the file last of all to ensure we still set the bill run status, even if deletion fails.
      if (this._removeTemporaryFiles()) {
        await DeleteFileService.go(generatedFile)
      }
    } catch (error) {
      notifier.omfg('Error sending transaction file', { generatedFile, error })
    }
  }

  static _validate (billRun) {
    if (!billRun.$pending()) {
      throw new Error(`Bill run ${billRun.id} does not have a status of 'pending'.`)
    }
  }

  static _checkIfFileNeeded (billRun) {
    return billRun.$billable()
  }

  /**
   * Generate and send the transaction file. Returns the path and filename of the generated file.
   */
  static async _generateAndSend (billRun, regime) {
    const filename = this._filename(billRun.fileReference)
    const generatedFile = await GenerateTransactionFileService.go(billRun, filename)

    // The key is the remote path and filename in the S3 bucket, eg. 'wrls/transaction/nalai50001.dat'
    const key = path.join(regime.slug, 'transaction', filename)

    await SendFileToS3Service.go(generatedFile, key)

    return generatedFile
  }

  static _filename (fileReference) {
    return `${fileReference}.dat`
  }

  static _removeTemporaryFiles () {
    return removeTemporaryFiles
  }

  static async _setBillingNotRequiredStatus (billRun) {
    await billRun.$query()
      .patch({ status: 'billing_not_required' })
  }

  static async _setBilledStatus (billRun) {
    await billRun.$query()
      .patch({ status: 'billed' })
  }
}

module.exports = SendTransactionFileService
