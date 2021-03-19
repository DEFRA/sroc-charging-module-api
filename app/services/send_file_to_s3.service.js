'use strict'

/**
 * @module SendFileToS3Service
 */

const { S3Config, ServerConfig } = require('../../config')
const { removeTemporaryFiles, temporaryFilePath } = ServerConfig

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const fs = require('fs')
const path = require('path')

class SendFileToS3Service {
  /**
   * Send a file to an AWS S3 bucket. We optionally send it to the archive bucket, and based on server config we
   * optionally delete the temp file.
   *
   * @param {string} localFilenameWithPath The name and path of the file to be sent to S3.
   * @param {string} key The key is the path and filename the file will have in the bucket. For example,
   * 'wrls/transaction/nalai50001.dat'. Note that we prepend this with 'export'.
   * @param {function} notify The server.methods.notify method, which we pass in as server.methods isn't accessible
   * within a service.
   * @param {boolean} [copyToArchive] Whether the file is also be sent to the archive bucket. Defaults to `true`.
   * @returns {boolean} Returns `true` if the file was successfully sent and `false` if it failed.
  */

  static async go (localFilenameWithPath, key, notify, copyToArchive = true) {
    // We always upload into the top-level export folder so prepend the key we've been given with 'export/'
    const exportKey = path.join('export', key)

    try {
      await this._sendFile(this._uploadBucket(), exportKey, localFilenameWithPath)

      if (copyToArchive) {
        await this._sendFile(this._archiveBucket(), exportKey, localFilenameWithPath)
      }
    } catch (error) {
      notify(`Error sending file ${localFilenameWithPath} to bucket ${this._uploadBucket()}: ${error}`)
      return false
    }

    if (this._removeTemporaryFiles()) {
      try {
        fs.unlinkSync(localFilenameWithPath)
      } catch (error) {
        notify(`Error deleting file ${localFilenameWithPath}: ${error}`)
      }
    }

    // Note that we return true even if file deletion failed as the file has been sent
    return true
  }

  static async _sendFile (bucket, key, filenameWithPath) {
    // We start by creating a new instance of the S3 client. Note that our AWS region and credentials are set in .env so
    // we don't need to specify them here
    const client = new S3Client()

    const file = await this._getFile(filenameWithPath)
    const params = this._sendParams(bucket, key, file)

    // Instantiate the command to send to the client, passing in the params
    const command = new PutObjectCommand(params)

    // Run the command
    await client.send(command)
  }

  static async _getFile (filenameWithPath) {
    return fs.readFileSync(filenameWithPath)
  }

  static _sendParams (bucket, key, body) {
    return {
      Bucket: bucket,
      Key: key,
      Body: body
    }
  }

  static _temporaryFilePath () {
    return temporaryFilePath
  }

  static _removeTemporaryFiles () {
    return removeTemporaryFiles
  }

  static _uploadBucket () {
    return S3Config.uploadBucket
  }

  static _archiveBucket () {
    return S3Config.archiveBucket
  }
}

module.exports = SendFileToS3Service
