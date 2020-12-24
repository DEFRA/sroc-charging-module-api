'use strict'

const { BillRunModel } = require('../../../app/models')

class BillRunHelper {
  /**
   * Create a bill run
   *
   * @param {string} authorisedSystemId Id to use for the `created_by` field
   * @param {string} regimeId Id to use for the `regime_id` field
   * @param {string} [region] Region to use. Defaults to 'A'
   * @param {string} [status] Status to use. Defaults to 'initialised'
   *
   * @returns {module:BillRunModel} The newly created instance of `BillRunModel`.
   */
  static addBillRun (authorisedSystemId, regimeId, region = 'A', status = 'initialised') {
    return BillRunModel.query()
      .insert({
        createdBy: authorisedSystemId,
        regimeId: regimeId,
        region: region,
        status: status
      })
      .returning('*')
  }
}

module.exports = BillRunHelper
