'use strict'

/**
 * @module GenerateBillRunSummaryService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../models')

class GenerateBillRunSummaryService {
  /**
  * Initiates the generation of a bill run summary.
  *
  * @param
  * @returns
  */
  static async go (billRunId) {
    const billRun = await BillRunModel.query().findById(billRunId)

    this._validateBillRun(billRun, billRunId)

    await billRun.$query().patch({ status: 'generating_summary' })
  }

  static _validateBillRun (billRun, billRunId) {
    if (!billRun) {
      throw Boom.badData(`Bill run ${billRunId} is unknown.`)
    }

    if (billRun.$generatingSummary()) {
      throw Boom.conflict(`Summary for bill run ${billRun} is already being generated`)
    }
  }
}

module.exports = GenerateBillRunSummaryService
