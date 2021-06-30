/**
 * @module CustomerModel
 */

import BaseModel from './base.model.js'
import CustomerFileModel from './customer_file.model.js'
import RegimeModel from './regime.model.js'

export default class CustomerModel extends BaseModel {
  static get tableName () {
    return 'customers'
  }

  static get relationMappings () {
    return {
      customerFile: {
        relation: this.BelongsToOneRelation,
        modelClass: CustomerFileModel,
        join: {
          from: 'customers.customerFileId',
          to: 'customerFiles.id'
        }
      },
      regime: {
        relation: this.BelongsToOneRelation,
        modelClass: RegimeModel,
        join: {
          from: 'customers.regimeId',
          to: 'regimes.id'
        }
      }
    }
  }
}
