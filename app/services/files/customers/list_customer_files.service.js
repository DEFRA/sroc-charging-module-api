'use strict'

/**
 * @module ListCustomerFilesService
 */

const { CustomerFileModel } = require('../../../models')
const { JsonPresenter } = require('../../../presenters')

class ListCustomerFilesService {
  /**
   * Returns a JSON array of customer files
   *
   * @param {module:RegimeModel} regime Instance of `RegimeModel` representing the regime we are listing customer files
   * for
   *
   * @returns {module:CustomerFileModel[]} an array of `CustomerFileModel` based on customer files currently in the database
   */
  static async go (regime) {
    const customerFiles = await this._customerFiles(regime.id)

    return this._response(customerFiles)
  }

  static _customerFiles (regimeId) {
    return CustomerFileModel
      .query()
      .where('regimeId', regimeId)
  }

  static _response (customerFiles) {
    const presenter = new JsonPresenter(customerFiles)

    return presenter.go()
  }
}

module.exports = ListCustomerFilesService
