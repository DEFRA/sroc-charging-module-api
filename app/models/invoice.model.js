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
          from: 'invoices.billRunId',
          to: 'billRuns.id'
        }
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: 'transaction.model',
        join: {
          from: 'invoices.id',
          to: 'transactions.invoiceId'
        }
      },
      licences: {
        relation: Model.HasManyRelation,
        modelClass: 'licence.model',
        join: {
          from: 'invoices.id',
          to: 'licences.invoiceId'
        }
      }
    }
  }

  /**
   * If an invoice has been handled during generation of a bill run summary then it is said to be "summarised" and its
   * status is set accordingly.
   *
   * This returns true if the invoice has been summarised.
   */
  $summarised () {
    return this.status === 'summarised'
  }
}

module.exports = InvoiceModel
