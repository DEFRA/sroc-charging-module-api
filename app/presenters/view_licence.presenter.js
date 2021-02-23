'use strict'

/**
 * @module ViewLicencePresenter
 */

const BasePresenter = require('./base.presenter')
const ViewTransactionPresenter = require('./view_transaction.presenter')

/**
 * Handles formatting the licence data into the response we send to clients when a GET request is received
 */
class ViewLicencePresenter extends BasePresenter {
  _presentation (data) {
    return {
      id: data.id,
      licenceNumber: data.licenceNumber,
      creditLineCount: data.creditLineCount,
      creditLineValue: data.creditLineValue,
      debitLineCount: data.debitLineCount,
      debitLineValue: data.debitLineValue,
      zeroLineCount: data.zeroLineCount,
      subjectToMinimumChargeCount: data.subjectToMinimumChargeCount,
      netTotal: data.netTotal,
      transactions: data.transactions.map(transaction => {
        const presenter = new ViewTransactionPresenter(transaction)
        return presenter.go(transaction)
      })
    }
  }
}

module.exports = ViewLicencePresenter
