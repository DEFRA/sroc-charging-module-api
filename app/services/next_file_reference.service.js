'use strict'

/**
 * @module NextFileReferenceService
 */

const { SequenceCounterModel } = require('../models')

const { RulesServiceConfig } = require('../../config')

class NextFileReferenceService {
  /**
   * Returns the next file reference for the given region and regime
   *
   * The file number in the sequence_counters table is the last number issued. Therefore, we increment it by 1
   * and get the new number. We then take that value and format it as a **file reference**.
   *
   * The format is `nalri50001` where
   *
   * - `nal` is the filename prefix for the regime (set in `RulesServiceConfig`)
   * - `r` is the region lowercased
   * - `i` is a fixed digit "i"
   * - `50001` is our sequential file number padded which starts at 50000
   *
   * For example, if the regime was WRLS, the region was 'R' and the next file number was 3 the reference would be
   * `nalri50003`.
   *
   * If an invalid region & regime pair is supplied, an Objection `NotFoundError` is thrown
   *
   * @param {module:RegimeModel} regime instance of the `RegimeModel` that the reference is for
   * @param {string} region The region the reference is for
   * @param {Object} [trx] Optional Objection database `transaction` object to be used in the update to
   * `sequence_counters`
   *
   * @returns {string} the generated file reference
   */
  static async go (regime, region, trx = null) {
    const result = await this._updateSequenceCounter(regime.id, region, trx)

    return this._response(regime.slug, region, result.fileNumber)
  }

  static async _updateSequenceCounter (regimeId, region, trx) {
    return SequenceCounterModel.query(trx)
      .findOne({
        regime_id: regimeId,
        region
      })
      .increment('file_number', 1)
      .returning('file_number')
      .throwIfNotFound({
        message: 'Invalid combination of regime and region'
      })
  }

  static _response (regimeSlug, region, fileNumber) {
    const filenamePrefix = RulesServiceConfig.endpoints[regimeSlug].filenamePrefix

    return `${filenamePrefix}${region.toLowerCase()}i${fileNumber}`
  }
}

module.exports = NextFileReferenceService
