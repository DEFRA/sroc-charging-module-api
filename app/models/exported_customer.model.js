/**
 * @module ExportedCustomerModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

export default class ExportedCustomerModel extends BaseModel {
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
