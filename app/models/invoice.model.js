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
   *   .patch({ zeroValueInvoice: true })
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
          .whereRaw('debit_value - credit_value > 0')
          .whereRaw('debit_value - credit_value < ?', DEMINIMIS_LIMIT)
          .whereRaw('subject_to_minimum_charge_credit_value = 0')
          .whereRaw('subject_to_minimum_charge_debit_value = 0')
      },

      /**
       * minimum charge modifier selects all invoices where minimum charge applies.
       */
      minimumCharge (query) {
        query
          .where(() => {
            this.where('subjectToMinimumChargeCreditValue', '>', 0)
              .where('subjectToMinimumChargeCreditValue', '<', MINIMUM_CHARGE_LIMIT)
          })
          .orWhere(() => {
            this.where('subjectToMinimumChargeDebitValue', '>', 0)
              .where('subjectToMinimumChargeDebitValue', '<', MINIMUM_CHARGE_LIMIT)
          })
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
