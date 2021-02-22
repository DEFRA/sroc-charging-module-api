'use strict'

/**
 * @module RequestBillRunService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../models')

class RequestBillRunService {
  static async go (path, billRunId) {
    if (!this._billRunRelated(path)) {
      return null
    }

    const billRun = await this._billRun(billRunId)
    this._validateBillRun(billRun, billRunId)

    return billRun
  }

  static _billRunRelated (path) {
    const billRunRegex = new RegExp(/\/bill-runs/i)

    return billRunRegex.test(path)
  }

  static async _billRun (billRunId) {
    return await BillRunModel.query().findById(billRunId)
  }

  static _validateBillRun (billRun, billRunId) {
    if (!billRun) {
      throw Boom.notFound(`Bill run ${billRunId} is unknown.`)
    }
  }
}

module.exports = RequestBillRunService
