/**
 * @module ViewLicencePresenter
 */

import BasePresenter from './base.presenter.js'
import ViewTransactionPresenter from './view_transaction.presenter.js'

/**
 * Handles formatting the licence data into the response we send to clients when a GET request is received
 */
export default class ViewLicencePresenter extends BasePresenter {
  _presentation (data) {
    return {
      id: data.id,
      licenceNumber: data.licenceNumber,
      netTotal: data.netTotal,
      transactions: data.transactions.map(transaction => {
        const presenter = new ViewTransactionPresenter(transaction)
        return presenter.go()
      })
    }
  }
}
