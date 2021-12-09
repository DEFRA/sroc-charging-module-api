'use strict'

/**
 * @module ViewLicencePresenter
 */

const BasePresenter = require('./base.presenter')
const ViewTransactionPresenter = require('./view_transaction.presenter')

/**
 * Handles formatting the licence data into the response we send to clients when a GET request is received. Note that we
 * expect ruleset to be passed in on top of the regular licenec data.
 */
class ViewLicencePresenter extends BasePresenter {
  _presentation (data) {
    return {
      id: data.id,
      licenceNumber: data.licenceNumber,
      netTotal: data.netTotal,
      transactions: data.transactions.map(transaction => {
        const presenter = new ViewTransactionPresenter({ ...transaction, ruleset: data.ruleset })
        return presenter.go()
      })
    }
  }
}

module.exports = ViewLicencePresenter
