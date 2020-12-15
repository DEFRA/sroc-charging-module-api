'use strict'

/**
 * @module AuthorisedSystemModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

class AuthorisedSystemModel extends BaseModel {
  static get tableName () {
    return 'authorised_systems'
  }

  static get relationMappings () {
    return {
      regimes: {
        relation: Model.ManyToManyRelation,
        modelClass: 'regime.model',
        join: {
          from: 'authorised_systems.id',
          through: {
            // authorised_systems_regimes is a join table
            from: 'authorised_systems_regimes.authorised_system_id',
            to: 'authorised_systems_regimes.regime_id'
          },
          to: 'regimes.id'
        }
      },
      billRuns: {
        relation: Model.HasManyRelation,
        modelClass: 'bill_run.model',
        join: {
          from: 'authorised_systems.id',
          to: 'bill_runs.created_by'
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

module.exports = AuthorisedSystemModel
