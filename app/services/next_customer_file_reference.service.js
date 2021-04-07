'use strict'

/**
 * @module NextCustomerFileReferenceService
 */

const BaseNextFileReferenceService = require('./base_next_file_reference.service')

class NextCustomerFileReferenceService extends BaseNextFileReferenceService {
  /**
   * Returns the next customer file reference for the given region and regime, in the format `nalrc50001`. See
   * `BaseNextFileReferenceService` for further details.
   */
  static _field () {
    return 'customerFileNumber'
  }

  static _fileFixedChar () {
    return 'c'
  }
}

module.exports = NextCustomerFileReferenceService
