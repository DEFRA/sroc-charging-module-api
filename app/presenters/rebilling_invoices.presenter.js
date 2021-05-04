'use strict'

/**
 * @module RebillingInvoicesPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Handles formatting the details of the rebilling and cancelling invoices involved in a rebilling request.
 *
 * Receives an array of invoices and returns the id and rebilled type of each one.
 */
class RebillingInvoicesPresenter extends BasePresenter {
  _presentation (data) {
    return {
      invoices: data.map(invoice => {
        return {
          id: invoice.id,
          rebilledType: invoice.rebilledType
        }
      })
    }
  }
}

module.exports = RebillingInvoicesPresenter
