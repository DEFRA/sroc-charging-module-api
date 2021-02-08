'use strict'

/**
 * @module BillRunStatusService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../models')
const { BillRunStatusPresenter } = require('../presenters')

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
    const billRun = await BillRunModel.query().findById(billRunId)

    if (billRun) {
      return billRun
    }

    throw Boom.notFound(`Bill run ${billRunId} is unknown.`)
  }

  static _response (billRun) {
    const presenter = new BillRunStatusPresenter(billRun)

    return presenter.go()
  }
}

module.exports = BillRunStatusService
