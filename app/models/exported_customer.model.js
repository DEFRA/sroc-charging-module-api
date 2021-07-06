/**
 * @module ExportedCustomerModel
 */

import BaseModel from './base.model.js'
import CustomerFileModel from './customer_file.model.js'

export default class ExportedCustomerModel extends BaseModel {
  static get tableName () {
    return 'exportedCustomers'
  }

  static get relationMappings () {
    return {
      customerFile: {
        relation: this.BelongsToOneRelation,
        modelClass: CustomerFileModel,
        join: {
          from: 'exported_customers.customerFileId',
          to: 'customerFiles.id'
        }
      }
    }
  }
}
