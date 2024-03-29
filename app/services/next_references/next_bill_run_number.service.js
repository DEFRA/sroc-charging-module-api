'use strict'

/**
 * @module NextBillRunNumberService
 */

const SequenceCounterModel = require('../../models/sequence_counter.model.js')

class NextBillRunNumberService {
  /**
   * Returns the next bill_run_number for the given region and regime
   *
   * The bill run number in the sequence_counters table is the last number issued
   * Therefore, we increment it by 1 and return the new number
   *
   * If an invalid region & regime pair is supplied, an Objection NotFoundError is thrown
   *
   * @param {string} regimeId Id of the regime to get the next counter for
   * @param {string} region The region to get the next counter for
   * @returns {integer} Value of the next counter
   */
  static async go (regimeId, region) {
    const result = await this._updateSequenceCounter(regimeId, region)

    return this._response(result)
  }

  static async _updateSequenceCounter (regimeId, region) {
    return SequenceCounterModel.query()
      .findOne({
        regime_id: regimeId,
        region
      })
      .increment('bill_run_number', 1)
      .returning('bill_run_number')
      .throwIfNotFound({
        message: 'Invalid combination of regime and region'
      })
  }

  static _response (result) {
    return result.billRunNumber
  }
}

module.exports = NextBillRunNumberService
