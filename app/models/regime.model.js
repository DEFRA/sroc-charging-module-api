'use strict'

/**
 * @module RegimeModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

class RegimeModel extends BaseModel {
  static get tableName () {
    return 'regimes'
  }

  static get relationMappings () {
    return {
      authorisedSystems: {
        relation: Model.ManyToManyRelation,
        modelClass: 'authorised_system.model',
        join: {
          from: 'regimes.id',
          through: {
            // authorised_systems_regimes is a join table
            from: 'authorised_systems_regimes.regime_id',
            to: 'authorised_systems_regimes.authorised_system_id'
          },
          to: 'authorised_systems.id'
        }
      },
      billRuns: {
        relation: Model.HasManyRelation,
        modelClass: 'bill_run.model',
        join: {
          from: 'regimes.id',
          to: 'bill_runs.regime_id'
        }
      }
    }
  }
}

module.exports = RegimeModel
