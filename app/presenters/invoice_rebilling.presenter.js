/**
 * @module InvoiceRebillingPresenter
 */

import BasePresenter from './base.presenter.js'

/**
 * Handles formatting the details of the rebilling and cancelling invoices involved in a rebilling request.
 *
 * Receives an array of invoices and returns the id and rebilled type of each one.
 */
export default class InvoiceRebillingPresenter extends BasePresenter {
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
