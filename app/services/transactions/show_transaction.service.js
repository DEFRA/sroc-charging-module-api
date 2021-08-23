'use strict'

/**
 * @module ShowTransactionService
 */

const Boom = require('@hapi/boom')

const { TransactionModel } = require('../../models')
const { JsonPresenter } = require('../../presenters')

/**
 * Returns the transaction with matching Id
 *
 * If no matching transaction is found it will throw a `Boom.notFound()` error (404)
 *
 * @param {string} id Id of the transaction to find
 *
 * @returns {module:TransactionModel} an instance `TransactionModel` if found else it will throw a `Boom.notFound()`
 * error (404)
 */
class ShowTransactionService {
  static async go (id) {
    const transaction = await this._transaction(id)

    if (!transaction) {
      throw Boom.notFound(`No transaction found with id ${id}`)
    }

    return this._response(transaction)
  }

  static _transaction (id) {
    return TransactionModel.query()
      .findById(id)
      .withGraphFetched('billRun')
      .withGraphFetched('invoice')
      .withGraphFetched('licence')
  }

  static _response (transaction) {
    const transactionType = this._transactionType(transaction.invoice)
    Object.assign(transaction.invoice, { transactionType })

    const signedChargeValue = this._signedChargeValue(transaction)
    Object.assign(transaction, { signedChargeValue })

    const presenter = new JsonPresenter(transaction)

    return presenter.go()
  }

  static _signedChargeValue (transaction) {
    const { chargeCredit, chargeValue } = transaction
    return chargeCredit ? -chargeValue : chargeValue
  }

  static _transactionType (invoice) {
    return invoice.$transactionType()
  }
}

module.exports = ShowTransactionService
