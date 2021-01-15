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
            from: 'authorisedSystemsRegimes.regimeId',
            to: 'authorisedSystemsRegimes.authorisedSystemId'
          },
          to: 'authorised_systems.id'
        }
      },
      billRuns: {
        relation: Model.HasManyRelation,
        modelClass: 'bill_run.model',
        join: {
          from: 'regimes.id',
          to: 'billRuns.regimeId'
        }
      },
      sequenceCounters: {
        relation: Model.ManyToManyRelation,
        modelClass: 'sequence_counters.model',
        join: {
          from: 'regimes.id',
          to: 'sequenceCounters.regimeId'
        }
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: 'transaction.model',
        join: {
          from: 'regimes.id',
          to: 'transactions.regimeId'
        }
      }
    }
  }
}

module.exports = RegimeModel
