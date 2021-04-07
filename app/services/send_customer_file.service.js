'use strict'

/**
 * @module SendCustomerFileService
 */

const path = require('path')

const { ServerConfig } = require('../../config')
const { removeTemporaryFiles } = ServerConfig

const GenerateCustomerFileService = require('./generate_customer_file.service')
const SendFileToS3Service = require('./send_file_to_s3.service')
const DeleteFileService = require('./delete_file.service')

class SendCustomerFileService {
  /**
   * Organises the generation and sending of a customer file:
   * - ...
   *
   * The service accepts an array of regions. It is expected that when it is called during the "send bill run" process
   * we will receive an array containing just the region of the bill run, and an array will only be passed to it by the
   * automated once-a-week "send all customer files" process.
   *
   * @param {module:RegimeModel} regime The regime that the customer file is to be generated for.
   * @param {array} regions An arry of regions we want to send the customer file for.
   * @param {function} notify The server.methods.notify method, which we pass in as server.methods isn't accessible
   * within a service.
   */
  static async go (regime, regions, notify) {
    let generatedFile
    const generatedFiles = []

    for (const region of regions) {
      try {
        const fileNeeded = await this._checkIfFileNeeded(regime, region)
        if (!fileNeeded) {
          break
        }

        generatedFile = await this._generateAndSend(regime, region)
        generatedFiles.push(generatedFile)

        // Clean up
        await this._clearCustomerTable(regime, region)
        if (this._removeTemporaryFiles()) {
          await DeleteFileService.go(generatedFile)
        }
      } catch (error) {
        // TODO: This should use the new plugin and .omfg
        this._notifyError(notify, 'Error sending customer file', generatedFile, error)
      }
    }
  }

  static async _checkIfFileNeeded (regime, region) {
    // TODO: Do a select query on the customer table and return true/false depending on the results
    return true
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

  static _clearCustomerTable (regime, region) {
    // TODO: Delete content of the customer table for this regime and region
  }

  static _notifyError (notifier, message, filename, error) {
    notifier(
      message,
      { filename, error }
    )
  }
}

module.exports = SendCustomerFileService
