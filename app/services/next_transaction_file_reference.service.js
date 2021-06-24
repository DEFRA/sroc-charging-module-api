/**
 * @module NextTransactionFileReferenceService
 */

const BaseNextFileReferenceService = require('./base_next_file_reference.service')

/**
 * Returns the next transaction file reference for the given region and regime, in the format `nalri50001`. See
 * `BaseNextFileReferenceService` for further details.
 */
class NextTransactionFileReferenceService extends BaseNextFileReferenceService {
  static _field () {
    return 'transactionFileNumber'
  }

  static _fileFixedChar () {
    return 'i'
  }
}

module.exports = NextTransactionFileReferenceService
