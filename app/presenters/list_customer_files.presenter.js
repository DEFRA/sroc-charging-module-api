'use strict'

/**
 * @module ListCustomerFilesPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Formats data for the list customer files endpoint.
 */
class ListCustomerFilesPresenter extends BasePresenter {
  _presentation (data) {
    return data.map(file => {
      return {
        fileReference: file.fileReference,
        exportedCustomers: file.exportedCustomers.map(customer => customer.customerReference)
      }
    })
  }
}

module.exports = ListCustomerFilesPresenter
