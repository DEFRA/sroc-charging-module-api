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
   * - Generates the transaction file;
   * - Sends the transaction file to the S3 bucket.
   *
   * @param {module:BillRunModel} billRun The bill run we want to send the transaction file for.
   * @param {module:RegimeModel} regime The regime that the bill run belongs to. The regime slug will form part of the
   * path we upload to.
   * @param {function} notify The server.methods.notify method, which we pass in as server.methods isn't accessible
   * within a service.
   */
  static async go (billRun, regime, notify) {
    this._validateBillRun(billRun)

    // We only need to generate a file if there are invoices on it that need to be charged
    const fileNeeded = this._checkIfFileNeeded(billRun)

    // If a file is needed then generate and send it, and set readyToBeBilled to true or false depending on whether we
    // succeed. If a file isn't needed then we still want to set the bill run status to 'billed', so we set
    // readyToBeBilled to `true`
    const readyToBeBilled = fileNeeded
      ? this._generateAndSend(billRun, regime, notify)
      : true

    if (readyToBeBilled) {
      this._billed(billRun)
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
  static _generateAndSend (billRun, regime, notify) {
    const filename = this._filename(billRun.fileReference)
    const generatedFile = GenerateTransactionFileService.go(filename, notify)

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

  static async _billed (billRun) {
    await billRun.$query()
      .patch({ status: 'billed' })
  }
}

module.exports = SendTransactionFileService
