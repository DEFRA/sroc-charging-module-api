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
      netTotal: data.netTotal,
      transactions: data.transactions.map(transaction => {
        const presenter = new ViewTransactionPresenter(transaction)
        return presenter.go()
      })
    }
  }
}

module.exports = ViewLicencePresenter
