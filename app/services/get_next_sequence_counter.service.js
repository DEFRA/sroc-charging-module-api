'use strict'

/**
 * @module GetNextSequenceCounterService
 */

const { SequenceCounterModel } = require('../models')

/**
 * Returns the next bill_run_number for the given region and regime
 *
 * The bill run number in the sequence_counters table is the last number issued
 * Therefore, we increment it by 1 and return the new number
 *
 * @param {string} regimeId Id of the regime to get the next counter for
 * @param {string} region The region to get the next counter for
 * @returns {integer} Value of the next counter
 */
class GetNextSequenceCounterService {
  static async go (regimeId, region) {
    return SequenceCounterModel.query()
      .increment('billRunNumber', 1)
      .where('regime_id', '=', regimeId)
      .andWhere('region', '=', region)
      .first()
      .returning('*')
  }
}

module.exports = GetNextSequenceCounterService
