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
      authorisedSystem: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'authorised_system.model',
        join: {
          from: 'transactions.created_by',
          to: 'authorised_systems.id'
        }
      },
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill_run.model',
        join: {
          from: 'transactions.bill_run_id',
          to: 'bill_runs.id'
        }
      },
      regime: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'regime.model',
        join: {
          from: 'transactions.regime_id',
          to: 'regimes.id'
        }
      },
      invoice: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'invoice.model',
        join: {
          from: 'transactions.invoice_id',
          to: 'invoices.id'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'transactions.licence_id',
          to: 'licences.id'
        }
      }
    }
  }
}

module.exports = TransactionModel
