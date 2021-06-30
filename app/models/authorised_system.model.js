/**
 * @module AuthorisedSystemModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

export default class AuthorisedSystemModel extends BaseModel {
  static get tableName () {
    return 'authorisedSystems'
  }

  static get relationMappings () {
    return {
      billRuns: {
        relation: Model.HasManyRelation,
        modelClass: 'bill_run.model',
        join: {
          from: 'authorisedSystems.id',
          to: 'billRuns.createdBy'
        }
      },
      regimes: {
        relation: Model.ManyToManyRelation,
        modelClass: 'regime.model',
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
        relation: Model.HasManyRelation,
        modelClass: 'transaction.model',
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
