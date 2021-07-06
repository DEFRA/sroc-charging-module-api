/**
 * @module CreateTransactionPresenter
 */

import BasePresenter from './base.presenter.js'

/**
 * Handles formatting the data into the response we send to clients after a create transaction request.
 */
export default class CreateTransactionPresenter extends BasePresenter {
  _presentation (data) {
    return {
      transaction: {
        id: data.id,
        clientId: data.clientId
      }
    }
  }
}
