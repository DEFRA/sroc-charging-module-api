'use strict'

/**
 * @module CreateTransactionPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Handles formatting the data into the response we send to clients after a create transaction request.
 */
class CreateTransactionPresenter extends BasePresenter {
  _presentation (data) {
    return {
      transaction: {
        id: data.id
      }
    }
  }
}

module.exports = CreateTransactionPresenter
