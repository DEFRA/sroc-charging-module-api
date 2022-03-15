'use strict'

const RegimeModel = require('../../../app/models/regime.model.js')

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
   * Create a regime. If a regime with the provided slug already exists then this will be returned and a new regime will
   * not be created.
   *
   * @param {string} slug Short-code for the regime. Is how we match regime endpoints to regimes in our database
   * @param {string} name Name for the regime
   * @returns {module:RegimeModel} The newly created instance of `RegimeModel`.
   */
  static async addRegime (slug, name) {
    const regime = await RegimeModel.query()
      .findOne({ slug })

    if (regime) {
      return regime
    }

    return RegimeModel.query()
      .insert({
        slug: slug,
        name: name,
        preSrocCutoffDate: '2018-04-01'
      })
      .returning('*')
  }
}

module.exports = RegimeHelper
