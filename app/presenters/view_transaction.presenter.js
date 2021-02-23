'use strict'

/**
 * @module ViewTransactionPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Handles formatting the transaction data into the response we send to clients when a GET request is received
 */
class ViewTransactionPresenter extends BasePresenter {
  _presentation (data) {
    return {
      id: data.id
    }
  }
}

module.exports = ViewTransactionPresenter
