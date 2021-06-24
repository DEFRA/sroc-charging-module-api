/**
 * @module BillRunStatusService
 */

const { BillRunStatusPresenter } = require('../presenters')

class BillRunStatusService {
  /**
   * Initiator method of the service. When called the service will take the bill run instance and return a very simple
   * JSON object that contains just it's status.
   *
   * @param {@module:BillRunModel} billRun Instance of the bill run to check the status of
   *
   * @returns {Object} A JSON object that holds the status of the bill run
   */
  static async go (billRun) {
    return this._response(billRun)
  }

  static _response (billRun) {
    const presenter = new BillRunStatusPresenter(billRun)

    return presenter.go()
  }
}

module.exports = BillRunStatusService
