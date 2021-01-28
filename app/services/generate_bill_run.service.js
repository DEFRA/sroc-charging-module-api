'use strict'

/**
 * @module GenerateBillRunService
 */

const Boom = require('@hapi/boom')

// Files in the same folder cannot be destructured from index.js so have to be required directly
const CreateMinimumChargeAdjustmentService = require('./create_minimum_charge_adjustment.service')

const { BillRunModel } = require('../models')

class GenerateBillRunService {
  /**
  * Initiates the generation of a bill run summary.
  *
  * @param
  * @returns
  */
  static async go (billRunId) {
    const billRun = await BillRunModel.query().findById(billRunId)

    await this._validateBillRun(billRun, billRunId)

    const minimumValueTransactions = await CreateMinimumChargeAdjustmentService.go(billRun)

    await BillRunModel.transaction(async trx => {
      await this._setGeneratingStatus(billRun, trx)
      await this._saveTransactions(minimumValueTransactions, trx)
      await this._summariseBillRun(billRun, trx)
    })

    return billRun
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

  static async _setGeneratingStatus (billRun) {
    await billRun.$query()
      .patch({ status: 'generating' })
  }

  static async _saveTransactions (transactions, trx) {

  }

  static async _summariseBillRun (billRun, trx) {
    await this._summariseZeroValueInvoices(billRun, trx)
    await this._summariseDeminimisInvoices(billRun, trx)
  }

  static async _summariseZeroValueInvoices (billRun, trx) {
    return billRun.$relatedQuery('invoices', trx)
      .modify('zeroValue')
      .patch({ summarised: true })
  }

  static async _summariseDeminimisInvoices (billRun, trx) {
    return billRun.$relatedQuery('invoices', trx)
      .modify('deminimis')
      .patch({ summarised: true })
  }
}

module.exports = GenerateBillRunService
