/**
 * @module AuthorisedSystemModel
 */

import BaseModel from './base.model.js'
import BillRunModel from './bill_run.model.js'
import RegimeModel from './regime.model.js'
import TransactionModel from './transaction.model.js'

export default class AuthorisedSystemModel extends BaseModel {
  static get tableName () {
    return 'authorisedSystems'
  }

  static get relationMappings () {
    return {
      billRuns: {
        relation: this.HasManyRelation,
        modelClass: BillRunModel,
        join: {
          from: 'authorisedSystems.id',
          to: 'billRuns.createdBy'
        }
      },
      regimes: {
        relation: this.ManyToManyRelation,
        modelClass: RegimeModel,
        join: {
          from: 'authorisedSystems.id',
          through: {
            // authorisedSystemsRegimes is a join table
            from: 'authorisedSystemsRegimes.authorisedSystemId',
            to: 'authorisedSystemsRegimes.regimeId'
          },
          to: 'regimes.id'
        }
      },
      transactions: {
        relation: this.HasManyRelation,
        modelClass: TransactionModel,
        join: {
          from: 'authorisedSystems.id',
          to: 'transactions.createdBy'
        }
      }
    }
  }

  /**
   * Returns whether the authorised system is 'active' or not
   *
   * Checks the value of `status` on the instance and if 'active' it returns `true` else it returns `false`. We use this
   * as part of authorisation to determine if the client is permitted to use the service or not.
   *
   * @returns {boolean} whether this instance is 'active'
   */
  $active () {
    return (this.status.toLowerCase() === 'active')
  }
}
