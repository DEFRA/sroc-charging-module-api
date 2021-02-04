'use strict'

/**
 * @module ValidateBillRunService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../models')

class ValidateBillRunService {
  /**
  * Validates that the bill run exists and is in a state where it can be generated.
  *
  * @param {string} billRunId The id of the bill run to be generated.
  * @returns {boolean} It returns true if validation succeeds, otherwise an error will have been thrown.
  */
  static async go (billRunId) {
    const billRun = await BillRunModel.query().findById(billRunId)
    await this._validateBillRun(billRun, billRunId)
    return true
  }

  static _validateBillRun (billRun, billRunId) {
    if (!billRun) {
      throw Boom.badData(`Bill run ${billRunId} is unknown.`)
    }

    if (billRun.$generating()) {
      throw Boom.conflict(`Summary for bill run ${billRun.id} is already being generated`)
    }

    if (!billRun.$editable()) {
      throw Boom.badData(`Bill run ${billRun.id} cannot be edited because its status is ${billRun.status}.`)
    }

    if (billRun.$empty()) {
      throw Boom.badData(`Summary for bill run ${billRun.id} cannot be generated because it has no transactions.`)
    }
  }
}

module.exports = ValidateBillRunService
