/**
 * @module BillRunStatusPresenter
 */

import BasePresenter from './base.presenter.js'

/**
 * Handles formatting the data into the response we send to clients after a bill run status request.
 */
export default class BillRunStatusPresenter extends BasePresenter {
  _presentation (data) {
    return {
      status: data.status
    }
  }
}
