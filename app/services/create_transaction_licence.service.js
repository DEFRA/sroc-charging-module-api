'use strict'

/**
 * @module CreateTransactionLicenceService
 */

const { LicenceModel } = require('../models')
const CreateTransactionTallyService = require('./create_transaction_tally.service')

class CreateTransactionLicenceService {
  /**
  * Creates or finds the licence record then generates and returns a 'patch' object to be used update it based on values
  * in the transaction
  *
  * The service accepts a transaction and creates an entry in the `licences` table if one doesn't already exist for the
  * transaction's 'invoice/licence/customer ref/financial year' combo. It then generates a 'patch' object intended to be
  * used in a call to `LicenceModel.query().patch()`. The 'patch' object has 2 properties
  *
  * - the ID of the licence to update (determined by either the fetched or created `licence`)
  * - a child object specifiying which fields to update and how
  *
  * A full example would be
  *
  * ```
  * const patchObject = await CreateTransactionLicenceService.go(transaction)
  * await LicenceModel.query().findById(patchObject.id).patch(patchObject.update)
  * ```
  *
  * Note - Our experience is that patching a record in this way is more performant than updating the instance and
  * calling `$patch()` on it.
  *
  * @param {module:TransactionTranslator} transaction translator representing the transaction to be added
  *
  * @returns {Object} an object that contains the ID of the licence to be updated, and the updates to be applied
  */
  static async go (transaction) {
    const licence = await this._licence(transaction)

    return this._generatePatch(licence.id, transaction)
  }

  static async _licence ({
    invoiceId,
    billRunId,
    lineAttr1: licenceNumber
  }) {
    return LicenceModel.query()
      .findOrInsert(
        {
          invoiceId,
          billRunId,
          licenceNumber
        }
      )
  }

  static async _generatePatch (id, transaction) {
    const patch = {
      id: id,
      update: await CreateTransactionTallyService.go(transaction)
    }

    return patch
  }
}

module.exports = CreateTransactionLicenceService
