/**
 * @module RegimeModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

export default class RegimeModel extends BaseModel {
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
            // authorisedSystemsRegimes is a join table
            from: 'authorisedSystemsRegimes.regimeId',
            to: 'authorisedSystemsRegimes.authorisedSystemId'
          },
          to: 'authorisedSystems.id'
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
      customerFiles: {
        relation: Model.HasManyRelation,
        modelClass: 'customer_file.model',
        join: {
          from: 'regimes.id',
          to: 'customerFiles.regimeId'
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
