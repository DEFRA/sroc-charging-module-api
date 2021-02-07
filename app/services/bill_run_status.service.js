'use strict'

/**
 * @module BillRunStatusService
 */

const { BillRunModel } = require('../models')

/**
 * Use to locate a bill run, grab its status and return a simple response that contains it.
 */
class BillRunStatusService {
  /**
   * Initiator method of the service. When called the service will take the bill run id, locate the matching bill run
   * and return a very simple JSON object that just contains it's status.
   *
   * @param {string} billRunId The ID of the bill run to get the status for
   *
   * @returns {Object} A JSON object that holds the status of the bill run
   */
  static async go (billRunId) {
    const billRun = await this._billRun(billRunId)

    return this._response(billRun)
  }

  static async _billRun (billRunId) {
    return BillRunModel.query().findById(billRunId)
  }

  static _response (billRun) {
    return {
      status: billRun.status
    }
  }
}

module.exports = BillRunStatusService
