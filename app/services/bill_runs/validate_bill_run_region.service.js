'use strict'

/**
 * @module ValidateBillRunRegionService
 */

const Boom = require('@hapi/boom')

class ValidateBillRunRegionService {
  /**
   * Checks if the supplied region matches that of the bill run. Throws a 'Boom.badData()' error if it does not
   *
   * Intended to be used as part of the create bill run transaction process, where 'region' comes from the request
   * payload.
   *
   * @param {@module:BillRunModel} billRun Instance of the bill run to be validated
   * @param {string} region The region to be checked against the bill run
   */
  static async go (billRun, region) {
    await this._validateBillRun(billRun, region?.toUpperCase())
  }

  static async _validateBillRun (billRun, region) {
    if (billRun.region !== region) {
      throw Boom.badData(
        `Bill run ${billRun.id} is linked to region ${billRun.region} but transaction is linked to region ${region}.`
      )
    }
  }
}

module.exports = ValidateBillRunRegionService
