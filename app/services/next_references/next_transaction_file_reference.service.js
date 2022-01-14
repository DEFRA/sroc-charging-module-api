'use strict'

/**
 * @module NextTransactionFileReferenceService
 */

const BaseNextFileReferenceService = require('./base_next_file_reference.service')
const StaticLookupLib = require('../../lib/static_lookup.lib')

/**
 * Returns the next customer file reference for the given region, regime and ruleset, in the format `nalri50001t` where:
 *
 * - `nal` is the filename prefix for the regime (set in `RulesServiceConfig`)
 * - `r` is the region lowercased
 * - `i` is a fixed character for transaction files
 * - `50001` is our sequential file number padded which starts at 50000
 * - `t` is an optional suffix, which is only present for sroc transaction files
 *
 * For example, if the regime was WRLS, the region was 'R', the ruleset was sroc and the next file number was 3 then the
 * transaction file reference would be `nalri50003t`. If the ruleset was presroc then the reference would be
 * `nalri50003` without the `t` suffix.
 *
 * If an invalid ruleset has been supplied, a `TypeError` will be thrown.
 */

class NextTransactionFileReferenceService extends BaseNextFileReferenceService {
  static _field () {
    return 'transactionFileNumber'
  }

  static _response (regimeSlug, region, ruleset, fileNumber) {
    if (!StaticLookupLib.rulesets.includes(ruleset)) {
      throw new TypeError(`Invalid ruleset ${ruleset}`)
    }

    const filenamePrefix = this._getFilenamePrefix(regimeSlug)

    if (ruleset === 'sroc') {
      return this._srocResponse(filenamePrefix, region, fileNumber)
    }

    return this._presrocResponse(filenamePrefix, region, fileNumber)
  }

  /**
   * Returns an sroc response, eg. `nalri50003t`
   */
  static _srocResponse (filenamePrefix, region, fileNumber) {
    return `${filenamePrefix}${region.toLowerCase()}i${fileNumber}t`
  }

  /**
   * Returns a presroc response, eg. `nalri50003`
   */
  static _presrocResponse (filenamePrefix, region, fileNumber) {
    return `${filenamePrefix}${region.toLowerCase()}i${fileNumber}`
  }
}

module.exports = NextTransactionFileReferenceService
