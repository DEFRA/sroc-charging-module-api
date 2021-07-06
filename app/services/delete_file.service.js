/**
 * @module DeleteFileService
 */

import fs from 'fs'

export default class DeleteFileService {
  /**
   * Delete a file.
   *
   * @param {string} localFilenameWithPath The name and path of the file to be deleted.
  */

  static async go (localFilenameWithPath) {
    fs.unlinkSync(localFilenameWithPath)
  }
}
