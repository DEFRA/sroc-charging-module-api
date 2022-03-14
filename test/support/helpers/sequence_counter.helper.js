'use strict'

const SequenceCounterModel = require('../../../app/models/sequence_counter.model')

/**
 * Use to help with creating 'Sequence counter' records
 */
class SequenceCounterHelper {
  /**
   * Create a sequence counter for a regime and region
   *
   * @param {uuid} regimeId UUID for the regime
   * @param {string} region Code of the region
   * @returns {module:SequenceCounterModel} The newly created instance of `SequenceCounterModel`.
   */
  static addSequenceCounter (regimeId, region) {
    return SequenceCounterModel.query()
      .insert({ regimeId, region })
      .returning('*')
  }
}

module.exports = SequenceCounterHelper
