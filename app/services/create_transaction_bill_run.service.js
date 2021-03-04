'use strict'

/**
 * @module CreateTransactionBillRunService
 */

const Boom = require('@hapi/boom')

const CreateTransactionTallyService = require('./create_transaction_tally.service')

class CreateTransactionBillRunService {
  /**
  * Determines if a transaction is for the same region as the requested bill run and if so, generates a 'patch' object
  * intended to be used in a call to `BillRunModel.query().patch()`. The 'patch' object has 2 properties
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
    this._validateBillRun(billRun, transaction)

    return this._generatePatch(billRun.id, transaction)
  }

  static _validateBillRun (billRun, transaction) {
    if (billRun.region !== transaction.region) {
      throw Boom.badData(
        `Bill run ${billRun.id} is for region ${billRun.region} but transaction is for region ${transaction.region}.`
      )
    }
  }

  static async _generatePatch (id, transaction) {
    const patch = {
      id: id,
      update: await CreateTransactionTallyService.go(transaction)
    }

    return patch
  }
}

module.exports = CreateTransactionBillRunService
