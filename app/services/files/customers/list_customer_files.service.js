'use strict'

/**
 * @module ListCustomerFilesService
 */

const CustomerFileModel = require('../../../models/customer_file.model')

const ListCustomerFilesPresenter = require('../../../presenters/list_customer_files.presenter')

class ListCustomerFilesService {
  /**
   * Returns exported customer files and the customer references in them. The number of days to go back is required,
   * where 0 = all customer files exported today, 1 = all customer files exported yesterday and today, etc.
   *
   * @param {module:RegimeModel} regime Instance of `RegimeModel` for the regime the customer files belong to.
   * @param {integer} days The number of days of exported files to return.
   * @returns {Object[]} customerObj An array of objects representing exported customer files.
   * @returns {string} customerObj.fileReference The file reference of the exported customer file.
   * @returns {string[]} customerObj.exportedCustomers An array of customer references included in the exported file.
   */
  static async go (regime, days) {
    const customerFiles = await this._customerFiles(regime.id, days)

    return this._response(customerFiles)
  }

  static _customerFiles (regimeId, days) {
    const startDate = this._startDate(days)

    return CustomerFileModel
      .query()
      .where('regimeId', regimeId)
      .where('status', 'exported')
      .where('exportedAt', '>=', startDate)
      .select('id', 'fileReference', 'status', 'exportedAt')
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
