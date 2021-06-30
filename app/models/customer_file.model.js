/**
 * @module CustomerFileModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import CustomerModel from './customer.model.js'
import ExportedCustomerModel from './exported_customer.model.js'
import RegimeModel from './regime.model.js'

export default class CustomerFileModel extends BaseModel {
  static get tableName () {
    return 'customerFiles'
  }

  static get relationMappings () {
    return {
      customers: {
        relation: Model.HasManyRelation,
        modelClass: CustomerModel,
        join: {
          from: 'customerFiles.id',
          to: 'customers.customerFileId'
        }
      },
      exportedCustomers: {
        relation: Model.HasManyRelation,
        modelClass: ExportedCustomerModel,
        join: {
          from: 'customerFiles.id',
          to: 'exportedCustomers.customerFileId'
        }
      },
      regime: {
        relation: Model.BelongsToOneRelation,
        modelClass: RegimeModel,
        join: {
          from: 'customerFiles.regimeId',
          to: 'regimes.id'
        }
      }
    }
  }
}
