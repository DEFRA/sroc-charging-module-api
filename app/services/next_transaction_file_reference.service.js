/**
 * @module NextTransactionFileReferenceService
 */

import BaseNextFileReferenceService from './base_next_file_reference.service.js'

/**
 * Returns the next transaction file reference for the given region and regime, in the format `nalri50001`. See
 * `BaseNextFileReferenceService` for further details.
 */
export default class NextTransactionFileReferenceService extends BaseNextFileReferenceService {
  static _field () {
    return 'transactionFileNumber'
  }

  static _fileFixedChar () {
    return 'i'
  }
}
