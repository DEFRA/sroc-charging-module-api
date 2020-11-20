'use strict'

const { RegimeModel } = require('../../../app/models')

/**
 * Use to help wwith creating 'Regime' records
 *
 * The API is intended to support multiple regimes. Each supported regime is recorded in our 'regimes' table and
 * represented in the code by `RegimeModel`.
 *
 * Some endpoints will access the regime to determine how to responded. The most common usage though is checking if a
 * 'user' (authorised system) is permitted to access endpoints for a specific regime. So as part of being able to test
 * the API we need to be able to create both regimes and authorised systems.
 */
class RegimeHelper {
  /**
   * Create a regime
   *
   * @param {string} slug Short-code for the regime. Is how we match regime endpoints to regimes in our database
   * @param {string} name Name for the regiime
   * @returns {module:RegimeModel} The newly created instance of `RegimeModel`.
   */
  static addRegime (slug, name) {
    return RegimeModel.query()
      .insert({
        slug: slug,
        name: name,
        pre_sroc_cutoff_date: '2018-04-01'
      })
      .returning('*')
  }
}

module.exports = RegimeHelper
