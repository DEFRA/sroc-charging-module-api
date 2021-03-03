'use strict'

/**
 * @module CreateTransactionLicenceService
 */

const { LicenceModel } = require('../models')
const CreateTransactionTallyService = require('./create_transaction_tally.service')

class CreateTransactionLicenceService {
  /**
  * Accepts a transaction and creates an entry in the Licences table if one doesn't already exist for the transaction's
  * invoice/licence/customer ref/financial year. It updates the count and value stats as per the transaction details
  * and returns the resulting licence.
  *
  * Note that the updated stats are _not_ saved back to the database; it is up to the caller to do this.
  *
  * @param {Object} A transaction object
  * @returns {Object} A licence object
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
