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
   * @param {string} [ruleset] Ruleset to use. Defaults to 'sroc'
   *
   * @returns {module:BillRunModel} The newly created instance of `BillRunModel`.
   */
  static addBillRun (authorisedSystemId, regimeId, region = 'A', status = 'initialised', ruleset = 'presroc') {
    return BillRunModel.query()
      .insert({
        createdBy: authorisedSystemId,
        regimeId,
        region,
        status,
        ruleset
      })
      .returning('*')
  }

  /**
   * Mock generate a bill run
   *
   * We do not _actually_ generate a bill run with this helper. We simply update the bill run record to reflect what a
   * generated bill run would look like
   *
   * @param {string} billRunId Id of the bill run to update as 'generated'
   * @param {Object} [overrides] JSON object of values which will override those used by the helper. By default, this
   * helper will updated the `invoiceCount` to 1 and the `invoiceValue` to 5000. Use this to set other values, or to set
   * the credit note properties
   *
   * @returns {module:BillRunModel} An updated instance of `BillRunModel` for the bill run specified
   */
  static generateBillRun (billRunId, overrides = {}) {
    return BillRunModel.query()
      .findById(billRunId)
      .patch({
        ...this._defaultGenerateBillRunPatch(),
        ...overrides
      })
      .returning('*')
  }

  static _defaultGenerateBillRunPatch () {
    return {
      status: 'generated',
      invoiceCount: 1,
      invoiceValue: 5000
    }
  }
}

module.exports = BillRunHelper
