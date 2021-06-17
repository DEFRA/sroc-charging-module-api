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
   * @param {module:AuthorisedSystemModel} authorisedSystem The authorised system making the rebilling request (which
   * will therefore be set as the authorised system for the transaction).
   * @param {Object} [trx] Optional DB transaction this is being performed as part of.
   * @param {Boolean} [invert] Whether the transaction type should be inverted.
   * @returns {module:TransactionModel} The newly-created transaction.
   */
  static async go (transaction, licence, authorisedSystem, trx = null, invert = false) {
    const preparedTransaction = await this._prepareTransaction(transaction, licence, authorisedSystem, invert)
    const rebilledType = this._rebilledType(invert)

    return this._create(preparedTransaction, rebilledType, trx)
  }

  /**
   * Returns a new transaction object ready to be persisted in the db, based on the provided transaction with a few
   * changes:
   * - We set the id as `undefined` to avoid conflicting with the existing transaction;
   * - We set the clientId as `undefined` to avoid the unique constraint on regime and clientID in transactions table
   * - We set other fields we don't want copying as `undefined`;
   * - We set the bill run, invoice and licence ids based on the provided licence;
   * - We invert the credit boolean if required.
   */
  static async _prepareTransaction (transaction, licence, authorisedSystem, invert) {
    return TransactionModel.fromJson({
      ...transaction,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      clientId: undefined,
      createdBy: authorisedSystem.id,
      billRunId: licence.billRunId,
      invoiceId: licence.invoiceId,
      licenceId: licence.id,
      rebilledTransactionId: transaction.id,
      chargeCredit: invert ? !transaction.chargeCredit : transaction.chargeCredit
    })
  }

  /**
   * Returns the required value for rebilled_type based on the value of invert. If invert is `true` then this must be a
   * cancel invoice; otherwise it is a rebill invoice.
   */
  static _rebilledType (invert) {
    return invert ? 'C' : 'R'
  }

  /**
   * Creates a record in the db for the provided transaction and returns it
   */
  static async _create (transaction, rebilledType, trx) {
    await BillRunModel.patchTally(transaction, trx)
    await InvoiceModel.updateTally({ ...transaction, rebilledType }, trx)
    await LicenceModel.updateTally(transaction, trx)

    const newTransaction = await transaction.$query(trx)
      .insert(transaction)

    return newTransaction
  }
}

module.exports = InvoiceRebillingCreateTransactionService
