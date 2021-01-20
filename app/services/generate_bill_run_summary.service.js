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

    await this._validateBillRun(billRun, billRunId)
    await this._setGeneratingStatus(billRun)
    await this._summariseBillRun(billRun)

    return billRun
  }

  static _validateBillRun (billRun, billRunId) {
    if (!billRun) {
      throw Boom.badData(`Bill run ${billRunId} is unknown.`)
    }

    if (billRun.$generating()) {
      throw Boom.conflict(`Summary for bill run ${billRun.id} is already being generated`)
    }
  }

  static async _setGeneratingStatus (billRun) {
    await billRun.$query()
      .patch({ status: 'generating' })
  }

  static async _summariseBillRun (billRun) {
    await this._summariseZeroValueInvoices(billRun)
    await this._summariseDeminimisInvoices(billRun)
  }

  static async _summariseZeroValueInvoices (billRun) {
    return billRun.$relatedQuery('invoices')
      .modify('zeroValue')
      .patch({ summarised: true })
  }

  static async _summariseDeminimisInvoices (billRun) {
    return billRun.$relatedQuery('invoices')
      .modify('deminimis')
      .patch({ summarised: true })
  }
}

module.exports = GenerateBillRunSummaryService
