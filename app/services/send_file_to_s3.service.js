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
   * @param {string} filename The name of the file in the temp folder to be sent to S3.
   * @param {string} key The key is the path and filename the file will have in the bucket. For example,
   * 'wrls/transaction/nalai50001.dat'. Note that we prepend this with 'export'.
   * @param {function} notify The server.methods.notify method, which we pass in as server.methods isn't accessible
   * within a service.
   * @param {boolean} [copyToArchive] Whether the file is also be sent to the archive bucket. Defaults to `true`.
   * @returns {boolean} `true` if sending the file succeeded.
  */

  static async go (filename, key, notify, copyToArchive = true) {
    const localFilenameWithPath = path.join(this._temporaryFilePath(), filename)

    // We always upload into the top-level export folder so prepend the key we've been given with 'export/'
    const exportKey = path.join('export', key)

    await this._sendFile(this._uploadBucket(), exportKey, localFilenameWithPath)

    if (copyToArchive) {
      await this._sendFile(this._archiveBucket(), exportKey, filenameWithPath)
    }

    if (this._removeTemporaryFiles()) {
      // TODO: Delete temp file
    }

    return true
  }

  static async _sendFile (bucket, key, filenameWithPath, notify) {
    // We start by creating a new instance of the S3 client. Note that our AWS region and credentials are set in .env so
    // we don't need to specify them here
    const client = new S3Client()

    try {
      // Start by creating a stream object which reads in the desired file
      const stream = await this._getFileStream(filenameWithPath)

      // Define the params
      const params = this._sendParams(bucket, key, stream)

      // Instantiate the command to send to the client, passing in the desired params
      const command = new PutObjectCommand(params)

      // Run the command
      await client.send(command)
    } catch (error) {
      notify(`Error sending file ${filenameWithPath} to bucket ${bucket.service}: ${error}`)
    }
  }

  static async _getFileStream (filenameWithPath) {
    return fs.createReadStream(filenameWithPath)
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
