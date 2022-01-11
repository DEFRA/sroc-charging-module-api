'use strict'

/**
 * @module BaseNextFileReferenceService
 */

const { SequenceCounterModel } = require('../../models')

const { RulesServiceConfig } = require('../../../config')

class BaseNextFileReferenceService {
  /**
   * Base service for retrieving file references.
   *
   * File numbers in the sequence_counters table are the last number issued. Therefore, for a given field we increment
   * it by 1 to get the new number.
   *
   * The format is `nalri50001` where
   *
   * - `nal` is the filename prefix for the regime (set in `RulesServiceConfig`)
   * - `r` is the region lowercased
   * - `i` is a fixed character dependent on the file type ("i" for transaction files or "c" for customer files)
   * - `50001` is our sequential file number padded which starts at 50000
   *
   * For example, if the regime was WRLS, the region was 'R' and the next file number was 3 the transaction file
   * reference would be `nalri50003`.
   *
   * If an invalid region & regime pair is supplied, an Objection `NotFoundError` is thrown
   *
   * @param {module:RegimeModel} regime instance of the `RegimeModel` that the reference is for
   * @param {string} region The region the reference is for
   * @param {string} ruleset The ruleset the reference is for
   * @param {Object} [trx] Optional Objection database `transaction` object to be used in the update to
   * `sequence_counters`
   *
   * @returns {string} the generated file reference
   */
  static async go (regime, region, ruleset = null, trx = null) {
    const result = await this._updateSequenceCounter(regime.id, region, trx)

    return this._response(regime.slug, region, ruleset, result[this._field()])
  }

  static async _updateSequenceCounter (regimeId, region, trx) {
    return SequenceCounterModel.query(trx)
      .findOne({
        regime_id: regimeId,
        region
      })
      .increment(this._field(), 1)
      .returning(this._field())
      .throwIfNotFound({
        message: 'Invalid combination of regime and region'
      })
  }

  static _response (regimeSlug, region, ruleset, fileNumber) {
    const filenamePrefix = BaseNextFileReferenceService._getFilenamePrefix(regimeSlug)
    const filenameSuffix = BaseNextFileReferenceService._getFilenameSuffix(regimeSlug, ruleset)

    return `${filenamePrefix}${region.toLowerCase()}${this._fileFixedChar()}${fileNumber}${filenameSuffix}`
  }

  /**
   * Returns the filename prefix according to the regime
   */
  static _getFilenamePrefix (regimeSlug) {
    return RulesServiceConfig.endpoints[regimeSlug].filenamePrefix
  }

  /**
   * Returns the filename suffix according to the regime and ruleset. If this has not been defined in RulesServiceConfig
   * then an empty string will be returned
   */
  static _getFilenameSuffix (regimeSlug, ruleset) {
    // We use nullish coalescing to return the value if it exists, or '' if it doesn't. Optional chaining on rulesets
    // means we don't error if an invalid ruleset is passed in (which would be the case if no ruleset was passed to the
    // service so we defaulted to `null`
    return RulesServiceConfig.endpoints[regimeSlug].rulesets[ruleset]?.filenameSuffix ?? ''
  }

  /**
   * Returns the field in the `sequence_counters` table to be used.
   */
  static _field () {
    throw new Error("Extending service must implement '_field()'")
  }

  /**
   * Returns the fixed character in the filename, eg. "i" for a transaction file.
   */
  static _fileFixedChar () {
    throw new Error("Extending service must implement '_fileFixedChar()'")
  }
}

module.exports = BaseNextFileReferenceService
