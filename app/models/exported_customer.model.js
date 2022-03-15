'use strict'

/**
 * @module ExportedCustomerModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ExportedCustomerModel extends BaseModel {
  static get tableName () {
    return 'exportedCustomers'
  }

  static get relationMappings () {
    return {
      customerFile: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'customer_file.model',
        join: {
          from: 'exported_customers.customerFileId',
          to: 'customerFiles.id'
        }
      }
    }
  }
}

module.exports = ExportedCustomerModel
