'use strict'

/**
 * @module RequestBillRunService
 */

const { BillRunModel } = require('../models')

class RequestBillRunService {
  static async go (path, billRunId) {
    if (!this._billRunRelated(path)) {
      return null
    }

    const billRun = await this._billRun(billRunId)
    return billRun
  }

  static _billRunRelated (path) {
    const billRunRegex = new RegExp(/\/bill-runs/i)

    return billRunRegex.test(path)
  }

  static async _billRun (billRunId) {
    return await BillRunModel.query().findById(billRunId)
  }
}

module.exports = RequestBillRunService
