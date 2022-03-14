'use strict'

/**
 * @module ListCustomerFilesPresenter
 */

const BasePresenter = require('./base.presenter.js')

/**
 * Formats data for the list customer files endpoint.
 */
class ListCustomerFilesPresenter extends BasePresenter {
  _presentation (data) {
    return data.map(file => {
      return {
        id: file.id,
        fileReference: file.fileReference,
        status: file.status,
        exportedAt: file.exportedAt,
        exportedCustomers: file.exportedCustomers.map(customer => customer.customerReference)
      }
    })
  }
}

module.exports = ListCustomerFilesPresenter
