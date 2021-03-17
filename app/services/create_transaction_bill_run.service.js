'use strict'

/**
 * @module CreateTransactionBillRunService
 */

const { BillRunModel } = require('../models')
const CreateTransactionTallyService = require('./create_transaction_tally.service')

class CreateTransactionBillRunService {
  /**
  * Generates and returns a 'patch' object to be used to update the bill run based on values in the transaction
  *
  * It generates a 'patch' object intended to be used in a call to `InvoiceModel.query().patch()`. The 'patch' object
  * has 2 properties
  *
  * - the ID of the bill run to update (determined by the `billRun` param)
  * - a child object specifiying which fields to update and how
  *
  * A full example would be
  *
  * ```
  * const patchObject = await CreateTransactionBillRunService.go(billRun, transaction)
  * await BillRunModel.query().findById(patchObject.id).patch(patchObject.update)
  * ```
  *
  * Note - Our experience is that patching a bill run record in this way is more performant than updating the bill run
  * instance and calling `$patch()` on it.
  *
  * @param {module:BillRunModel} billRun the bill run this transaction is being added to
  * @param {module:TransactionTranslator} transaction translator representing the transaction to be added
  *
  * @returns {Object} an object that contains the ID of the bill run to be updated, and the updates to be applied
  */
  static async go (billRun, transaction) {
    return this._generatePatch(billRun.id, transaction)
  }

  static async _generatePatch (id, transaction) {
    const patch = {
      id,
      update: await CreateTransactionTallyService.go(transaction, BillRunModel.tableName).patch
    }

    return patch
  }
}

module.exports = CreateTransactionBillRunService
