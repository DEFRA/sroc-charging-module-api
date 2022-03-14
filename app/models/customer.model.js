'use strict'

/**
 * @module CustomerModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class CustomerModel extends BaseModel {
  static get tableName () {
    return 'customers'
  }

  static get relationMappings () {
    return {
      customerFile: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'customer_file.model',
        join: {
          from: 'customers.customerFileId',
          to: 'customerFiles.id'
        }
      },
      regime: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'regime.model',
        join: {
          from: 'customers.regimeId',
          to: 'regimes.id'
        }
      }
    }
  }
}

module.exports = CustomerModel
