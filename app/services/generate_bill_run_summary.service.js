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

    if (billRun.status === 'generating_summary') {
      throw Boom.conflict(`Summary for bill run ${billRun} is already being generated`)
    }

    // Set status to generating_summary
    await billRun.$query().patch({ status: 'generating_summary' })
  }
}

module.exports = GenerateBillRunSummaryService
