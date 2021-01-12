'use strict'

/**
 * @module InvoiceModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

class InvoiceModel extends BaseModel {
  static get tableName () {
    return 'invoices'
  }

  static get relationMappings () {
    return {
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill_run.model',
        join: {
          from: 'invoices.bill_run_id',
          to: 'bill_runs.id'
        }
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: 'transaction.model',
        join: {
          from: 'invoices.id',
          to: 'transactions.invoice_id'
        }
      },
      licences: {
        relation: Model.HasManyRelation,
        modelClass: 'transaction.model',
        join: {
          from: 'invoices.id',
          to: 'licences.invoice_id'
        }
      }
    }
  }
}

module.exports = InvoiceModel
