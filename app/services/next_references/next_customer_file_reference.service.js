'use strict'

/**
 * @module NextCustomerFileReferenceService
 */

const BaseNextFileReferenceService = require('./base_next_file_reference.service')

/**
 * Returns the next customer file reference for the given region and regime, in the format `nalrc50001` where:
 *
 * - `nal` is the filename prefix for the regime (set in `RulesServiceConfig`)
 * - `r` is the region lowercased
 * - `c` is a fixed character for customer files
 * - `50001` is our sequential file number padded which starts at 50000
 *
 * For example, if the regime was WRLS, the region was 'R' and the next file number was 3 then the customer file
 * reference would be `nalrc50003`.
 */

class NextCustomerFileReferenceService extends BaseNextFileReferenceService {
  static _field () {
    return 'customerFileNumber'
  }

  static _response (regimeSlug, region, _ruleset, fileNumber) {
    const filenamePrefix = this._getFilenamePrefix(regimeSlug)

    return `${filenamePrefix}${region.toLowerCase()}c${fileNumber}`
  }
}

module.exports = NextCustomerFileReferenceService
