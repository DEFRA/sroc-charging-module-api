'use strict'

/**
 * @module SendTransactionFileService
 */

const Boom = require('@hapi/boom')
const path = require('path')

const GenerateTransactionFileService = require('./generate_transaction_file.service')
const SendFileToS3Service = require('./send_file_to_s3.service')

class SendTransactionFileService {
  /**
   * Organises the generation and sending of a transaction file:
   * - Validates that the bill run is in the requisite state;
   * - Checks that a transaction file is required;
   * - Calls GenerateTransactionFileService to generate the transaction file;
   * - Calls SendFileToS3Service to send the transaction file to the S3 bucket;
   * - Sets the bill run status to 'billed' if everything was successful.
   *
   * @param {module:RegimeModel} regime The regime that the bill run belongs to. The regime slug will form part of the
   * path we upload to.
   * @param {module:BillRunModel} billRun The bill run we want to send the transaction file for.
   * @param {function} notify The server.methods.notify method, which we pass in as server.methods isn't accessible
   * within a service.
   */
  static async go (regime, billRun, notify) {
    this._validate(billRun)

    // If we don't need to generate a file then set the bill status to 'billing_not_required' and return early.
    const fileNeeded = this._checkIfFileNeeded(billRun)
    if (!fileNeeded) {
      await this._setBillingNotRequiredStatus(billRun)
      return
    }

    const generatedAndSent = await this._generateAndSend(billRun, regime, notify)
    if (generatedAndSent) {
      await this._setBilledStatus(billRun)
    }
  }

  static _validate (billRun) {
    if (!billRun.$pending()) {
      throw Boom.conflict(`Bill run ${billRun.id} does not have a status of 'pending'.`)
    }
  }

  static _checkIfFileNeeded (billRun) {
    return billRun.$billable()
  }

  /**
   * Generate and send the transaction file. Returns `true` if this succeeds, and `false` if any part of it fails.
   */
  static async _generateAndSend (billRun, regime, notify) {
    const filename = this._filename(billRun.fileReference)
    const generatedFile = await GenerateTransactionFileService.go(filename, notify)

    // GenerateTransactionFileService will return `false` if file generation failed; if this happens then we return
    // before we attempt to send the file.
    if (!generatedFile) {
      return false
    }

    // The key is the remote path and filename in the S3 bucket, eg. 'wrls/transaction/nalai50001.dat'
    const key = path.join(regime.slug, 'transaction', filename)

    // SendFileToS3Service returns a boolean indicating success, so we simply pass this back to our caller.
    return SendFileToS3Service.go(generatedFile, key, notify)
  }

  static _filename (fileReference) {
    return `${fileReference}.dat`
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
