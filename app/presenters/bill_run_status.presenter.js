'use strict'

/**
 * @module BillRunStatusPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Handles formatting the data into the response we send to clients after a bill run status request.
 */
class BillRunStatusPresenter extends BasePresenter {
  _presentation (data) {
    return {
      status: data.status
    }
  }
}

module.exports = BillRunStatusPresenter
