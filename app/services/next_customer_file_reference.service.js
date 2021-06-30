/**
 * @module NextCustomerFileReferenceService
 */

import BaseNextFileReferenceService from './base_next_file_reference.service.js'

/**
 * Returns the next customer file reference for the given region and regime, in the format `nalrc50001`. See
 * `BaseNextFileReferenceService` for further details.
 */
export default class NextCustomerFileReferenceService extends BaseNextFileReferenceService {
  static _field () {
    return 'customerFileNumber'
  }

  static _fileFixedChar () {
    return 'c'
  }
}
