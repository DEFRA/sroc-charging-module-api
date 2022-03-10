'use strict'

/**
 * @module ViewCustomerFileService
 */

const Boom = require('@hapi/boom')

const CustomerFileModel = require('../../../models/customer_file.model')
const JsonPresenter = require('../../../presenters/json.presenter')

/**
 * Returns the customer file with matching Id
 *
 * If no matching customer file is found it will throw a `Boom.notFound()` error (404)
 *
 * @param {string} id Id of the customer file to find
 * @returns {module:CustomerFileModel} a `CustomerFileModel` if found else it will throw a Boom 404 error
 */
class ViewCustomerFileService {
  static async go (id) {
    const customerFile = await this._customerFile(id)

    if (!customerFile) {
      throw Boom.notFound(`No customer file found with id ${id}`)
    }

    return this._response(customerFile)
  }

  static _customerFile (id) {
    return CustomerFileModel.query()
      .findById(id)
      .withGraphFetched('exportedCustomers')
  }

  static _response (customerFile) {
    const presenter = new JsonPresenter(customerFile)

    return presenter.go()
  }
}

module.exports = ViewCustomerFileService
