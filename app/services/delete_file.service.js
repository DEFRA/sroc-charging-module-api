'use strict'

/**
 * @module DeleteFileService
 */

const fs = require('fs')

class DeleteFileService {
  /**
   * Delete a file.
   *
   * @param {string} localFilenameWithPath The name and path of the file to be deleted.
  */

  static async go (localFilenameWithPath) {
    try {
      fs.unlinkSync(localFilenameWithPath)
    } catch (error) {
      throw new Error(error)
    }
  }
}

module.exports = DeleteFileService
