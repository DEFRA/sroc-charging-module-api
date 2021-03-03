'use strict'

/**
 * @module CustomerModel
 */

const BaseModel = require('./base.model')

class CustomerModel extends BaseModel {
  static get tableName () {
    return 'customers'
  }
}

module.exports = CustomerModel
