'use strict'

/**
 * @module InvoiceRebillingCreateTransactionService
 */

const { BillRunModel, InvoiceModel, LicenceModel, TransactionModel } = require('../models')

class InvoiceRebillingCreateTransactionService {
  /**
   * Creates a copy of a transaction for rebilling purposes. Accepts a transaction to duplicate along with the licence
   * to create it on. We can optionally invert the transaction type, so a debit transaction would become a credit and
   * vice-versa.
   *
   * @param {module:TransactionModel} transaction The transaction to be duplicated.
   * @param {module:LicenceModel} licence The licence the transaction should be created on.
   * @param {Boolean} [invert] Whether the transaction type should be inverted.
   * @returns {module:TransactionModel} The newly-created transaction.
   */
  static async go (transaction, licence, invert = false) {
    const preparedTransaction = await this._prepareTransaction(transaction, licence, invert)
    return this._create(preparedTransaction)
  }

  /**
   * Creates a new transaction ready to be persisted in the db. We set the
   */
  static async _prepareTransaction (transaction, licence, invert) {
    return TransactionModel.fromJson({
      ...transaction,
      id: undefined,
      billRunId: licence.billRunId,
      invoiceId: licence.invoiceId,
      licenceId: licence.id,
      chargeCredit: invert ? !transaction.chargeCredit : transaction.chargeCredit
    })
  }

  static async _create (transaction) {
    return TransactionModel.transaction(async trx => {
      await BillRunModel.patchTally(transaction, trx)
      await InvoiceModel.updateTally(transaction, trx)
      await LicenceModel.updateTally(transaction, trx)

      const newTransaction = await transaction.$query(trx)
        .insert(transaction)
        .returning('id')

      return newTransaction
    })
  }
}

module.exports = InvoiceRebillingCreateTransactionService
