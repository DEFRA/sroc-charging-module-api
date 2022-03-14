'use strict'

/**
 * @module CreateBillRunPresenter
 */

const BasePresenter = require('./base.presenter.js')

/**
 * Handles formatting the data into the response we send to clients after a create bill run request.
 */
class CreateBillRunPresenter extends BasePresenter {
  _presentation (data) {
    return {
      billRun: {
        id: data.id,
        billRunNumber: data.billRunNumber
      }
    }
  }
}

module.exports = CreateBillRunPresenter
