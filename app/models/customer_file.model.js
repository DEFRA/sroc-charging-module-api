/**
 * @module CustomerFileModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

class CustomerFileModel extends BaseModel {
  static get tableName () {
    return 'customerFiles'
  }

  static get relationMappings () {
    return {
      customers: {
        relation: Model.HasManyRelation,
        modelClass: 'customer.model',
        join: {
          from: 'customerFiles.id',
          to: 'customers.customerFileId'
        }
      },
      exportedCustomers: {
        relation: Model.HasManyRelation,
        modelClass: 'exported_customer.model',
        join: {
          from: 'customerFiles.id',
          to: 'exportedCustomers.customerFileId'
        }
      },
      regime: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'regime.model',
        join: {
          from: 'customerFiles.regimeId',
          to: 'regimes.id'
        }
      }
    }
  }
}

module.exports = CustomerFileModel
