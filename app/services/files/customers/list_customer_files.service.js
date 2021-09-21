'use strict'

/**
 * @module ListCustomerFilesService
 */

const { CustomerFileModel } = require('../../../models')
const { ListCustomerFilesPresenter } = require('../../../presenters')

class ListCustomerFilesService {
  static async go (regime, days) {
    const customerFiles = await this._customerFiles(regime.id, days)

    return this._response(customerFiles)
  }

  static _customerFiles (regimeId, days) {
    const startDate = this._startDate(days)

    return CustomerFileModel
      .query()
      .where('regimeId', regimeId)
      // do we want a modifier here?
      .where('status', 'exported')
      .where('exportedAt', '>', startDate)
      .select('fileReference')
      .withGraphFetched('exportedCustomers')
      .modifyGraph('exportedCustomers', builder => {
        builder.select('customerReference')
      })
  }

  /**
   * Returns a date object of a given number of days ago, set to midnight (ie. the start of the day)
   */
  static _startDate (days) {
    const date = new Date()

    // Set time to midnight and date to `days` days ago
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - days)

    return date
  }

  static _response (customerFiles) {
    const presenter = new ListCustomerFilesPresenter(customerFiles)

    return presenter.go()
  }
}

module.exports = ListCustomerFilesService
