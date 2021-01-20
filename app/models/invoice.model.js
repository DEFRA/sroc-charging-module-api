'use strict'

/**
 * @module InvoiceModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

const DEMINIMIS_LIMIT = 500

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
   * Modifiers allow us to reuse logic in queries, eg. to select all invoices which are zero value:
   *
   * return billRun.$relatedQuery('invoices')
   *   .modify('zeroValue')
   *   .patch({ summarised: true })
   */
  static get modifiers () {
    return {
      /**
       * zeroValue modifier selects all invoices which are zero value.
       */
      zeroValue (query) {
        query
          .where('creditCount', 0)
          .where('debitCount', 0)
          .where('zeroCount', '>', 0)
      },

      /**
       * deminimis modifier selects all invoices which are deminimis.
       */
      deminimis (query) {
        query
          .whereRaw('credit_value - debit_value > 0')
          .whereRaw('credit_value - debit_value < ?', DEMINIMIS_LIMIT)
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

  /**
    * This returns true if all transactions in the invoice are zero value.
    *
    * TODO: Confirm whether this is needed or whether the modifier is sufficient
    */
  $zeroValue () {
    return (this.creditCount === 0 && this.debitCount === 0 && this.zeroCount !== 0)
  }
}

module.exports = InvoiceModel
