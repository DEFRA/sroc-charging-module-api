'use strict'

/**
 * @module TransactionModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

class TransactionModel extends BaseModel {
  static get tableName () {
    return 'transactions'
  }

  static get relationMappings () {
    return {
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill_run.model',
        join: {
          from: 'transactions.bill_run_id',
          to: 'bill_runs.id'
        }
      }
    }
  }
}

module.exports = TransactionModel
