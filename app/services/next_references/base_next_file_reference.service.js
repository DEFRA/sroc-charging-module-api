'use strict'

/**
 * @module BaseNextFileReferenceService
 */

const { SequenceCounterModel } = require('../../models')

const { RulesServiceConfig } = require('../../../config')

class BaseNextFileReferenceService {
  /**
   * Base service for retrieving file references for a given regime, region and ruleset.
   *
   * File numbers in the sequence_counters table are the last number issued. Therefore, for a given field we increment
   * it by 1 to get the new number.
   *
   * If an invalid region & regime pair is supplied, an Objection `NotFoundError` is thrown.
   *
   * @param {module:RegimeModel} regime instance of the `RegimeModel` that the reference is for
   * @param {string} region The region the reference is for
   * @param {string} [ruleset] The ruleset the reference is for
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

  /**
   * Returns the filename prefix according to the regime
   */
  static _getFilenamePrefix (regimeSlug) {
    return RulesServiceConfig.endpoints[regimeSlug].filenamePrefix
  }

  /**
   * Returns the response.
   */
  static _response () {
    throw new Error("Extending service must implement '_response()'")
  }

  /**
   * Returns the field in the `sequence_counters` table to be used.
   */
  static _field () {
    throw new Error("Extending service must implement '_field()'")
  }
}

module.exports = BaseNextFileReferenceService
