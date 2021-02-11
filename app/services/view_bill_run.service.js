'use strict'

/**
 * @module ViewBillRunService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../models')
const { ViewBillRunPresenter } = require('../presenters')

/**
 * Locates a bill run and returns the available details
 */
class ViewBillRunService {
  /**
   * Fetches a bill run based on its id and returns the data needed by the View Bill Run endpoint
   *
   * @param {string} billRunId The id of the bill run we want to view
   *
   * @returns {Object} The requested bill run data
   */
  static async go (billRunId) {
    const billRun = await this._billRun(billRunId)

    return this._billRunResponse(billRun)
  }

  static async _billRun (billRunId) {
    const billRun = await BillRunModel.query()
      .findById(billRunId)
      .withGraphFetched('invoices')

    // The net total is not persisted in the db so we add in the result of the BillRunModel.$netTotal() method
    if (billRun) {
      return {
        ...billRun,
        netTotal: billRun.$netTotal()
      }
    }

    throw Boom.notFound(`Bill run ${billRunId} is unknown.`)
  }

  static _billRunResponse (billRun) {
    const presenter = new ViewBillRunPresenter(billRun)

    return presenter.go()
  }
}

module.exports = ViewBillRunService
