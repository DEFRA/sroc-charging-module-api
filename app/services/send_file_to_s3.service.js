/**
 * @module SendFileToS3Service
 */

const { S3Config, ServerConfig } = require('../../config')
const { temporaryFilePath } = ServerConfig

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const fs = require('fs')
const path = require('path')

class SendFileToS3Service {
  /**
   * Send a file to an AWS S3 bucket. We optionally send it to the archive bucket.
   *
   * @param {string} localFilenameWithPath The name and path of the file to be sent to S3.
   * @param {string} key The key is the path and filename the file will have in the bucket. For example,
   * 'wrls/transaction/nalai50001.dat'. Note that we prepend this with 'export'.
   * @param {boolean} [copyToArchive] Whether the file is also be sent to the archive bucket. Defaults to `true`.
  */

  static async go (localFilenameWithPath, key, copyToArchive = true) {
    // We always upload into the top-level export folder so prepend the key we've been given with 'export/'
    const exportKey = path.join('export', key)

    await this._sendFile(this._uploadBucket(), exportKey, localFilenameWithPath)

    if (copyToArchive) {
      await this._sendFile(this._archiveBucket(), exportKey, localFilenameWithPath)
    }
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

  static _uploadBucket () {
    return S3Config.uploadBucket
  }

  static _archiveBucket () {
    return S3Config.archiveBucket
  }
}

module.exports = SendFileToS3Service
