'use strict'

/**
 * @module InvoicePresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Handles formatting the data into the response we send to clients after a request to view an invoice
 */
class InvoicePresenter extends BasePresenter {
  _presentation (data) {
    return {
      id: data.id
    }
  }
}

module.exports = InvoicePresenter
