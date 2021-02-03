'use strict'

/**
 * @module InvoiceModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

const DEMINIMIS_LIMIT = 500
const MINIMUM_CHARGE_LIMIT = 2500

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
      },

      /**
       * minimum charge modifier selects all invoices where minimum charge applies.
       */
      minimumCharge (query) {
        query
          .where('subjectToMinimumChargeCreditValue', '<', MINIMUM_CHARGE_LIMIT)
          .orWhere('subjectToMinimumChargeDebitValue', '<', MINIMUM_CHARGE_LIMIT)
      },

      /**
       * credit modifier selects all invoices which are credits
       */
      credit (query) {
        query
          .whereRaw('credit_value > debit_value')
      },

      /**
       * debit modifier selects all invoices which are debits
       */
      debit (query) {
        query
          .whereRaw('debit_value > credit_value')
      }
    }
  }

  /**
   * netTotal method provides the net total of the invoice (debit value - credit value)
   */
  $netTotal () {
    return this.debitValue - this.creditValue
  }

  /**
   * absoluteNetTotal method provides the net total of the invoice as a positive value
   */
  $absoluteNetTotal () {
    return Math.abs(this.debitValue - this.creditValue)
  }
}

module.exports = InvoiceModel
