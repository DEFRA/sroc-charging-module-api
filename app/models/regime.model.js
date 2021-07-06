/**
 * @module RegimeModel
 */

import AuthorisedSystemModel from './authorised_system.model.js'
import BaseModel from './base.model.js'
import BillRunModel from './bill_run.model.js'
import CustomerFileModel from './customer_file.model.js'
import SequenceCounterModel from './sequence_counter.model.js'
import TransactionModel from './transaction.model.js'

export default class RegimeModel extends BaseModel {
  static get tableName () {
    return 'regimes'
  }

  static get relationMappings () {
    return {
      authorisedSystems: {
        relation: this.ManyToManyRelation,
        modelClass: AuthorisedSystemModel,
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
        relation: this.HasManyRelation,
        modelClass: BillRunModel,
        join: {
          from: 'regimes.id',
          to: 'billRuns.regimeId'
        }
      },
      customerFiles: {
        relation: this.HasManyRelation,
        modelClass: CustomerFileModel,
        join: {
          from: 'regimes.id',
          to: 'customerFiles.regimeId'
        }
      },
      sequenceCounters: {
        relation: this.ManyToManyRelation,
        modelClass: SequenceCounterModel,
        join: {
          from: 'regimes.id',
          to: 'sequenceCounters.regimeId'
        }
      },
      transactions: {
        relation: this.HasManyRelation,
        modelClass: TransactionModel,
        join: {
          from: 'regimes.id',
          to: 'transactions.regimeId'
        }
      }
    }
  }
}
