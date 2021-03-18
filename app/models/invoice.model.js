'use strict'

/**
 * @module InvoiceModel
 */

const { Model } = require('objection')
const BaseUpsertModel = require('./base_upsert.model')

const DEMINIMIS_LIMIT = 500
const MINIMUM_CHARGE_LIMIT = 2500

class InvoiceModel extends BaseUpsertModel {
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
       * zeroValue modifier selects all invoices which are net zero value.
       */
      zeroValue (query) {
        query
          .whereRaw('debit_line_value - credit_line_value = 0')
      },

      /**
       * deminimis modifier selects all invoices which are deminimis.
       */
      deminimis (query) {
        query
          .whereRaw('debit_line_value - credit_line_value > 0')
          .whereRaw('debit_line_value - credit_line_value < ?', DEMINIMIS_LIMIT)
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
          .whereRaw('credit_line_value > debit_line_value')
      },

      /**
       * debit modifier selects all invoices which are debits
       */
      debit (query) {
        query
          .whereRaw('debit_line_value > credit_line_value')
      },

      /**
       * billable modifier only returns those invoices which are not flagged as deminimis or zero value. Intended to
       * be used when `/send` a bill run is requested to determine which to generate transaction references for
       */
      billable (query) {
        query
          .where('zeroValueInvoice', false)
          .where('deminimisInvoice', false)
      }
    }
  }

  /**
   * Returns an object that contains the minimum (base) properties and values needed when inserting a new invoice
   *
   * See `BaseUpsertModel._baseOnInsertObject()` for more details
   *
   * @param {module:TransactionTranslator} transaction translator representing the transaction that will seed the new
   * invoice
   *
   * @return {Object} object that can built on and used with an Objection or Knex `.insert(myObject)` call
   */
  static _baseOnInsertObject (transaction) {
    return {
      billRunId: transaction.billRunId,
      customerReference: transaction.customerReference,
      financialYear: transaction.chargeFinancialYear
    }
  }

  /**
   * Returns an array of column names that are used for the unique constraint of an invoice to be UPSERT
   *
   * @returns {string[]} an array of the constraint field names
   */
  static _onConflictContraints () {
    return ['bill_run_id', 'customer_reference', 'financial_year']
  }

  /**
   * netTotal method provides the net total of the invoice (debit value - credit value)
   */
  $netTotal () {
    return this.debitLineValue - this.creditLineValue
  }

  /**
   * absoluteNetTotal method provides the net total of the invoice as a positive value
   */
  $absoluteNetTotal () {
    return Math.abs(this.debitLineValue - this.creditLineValue)
  }

  /**
   * transactionType method returns C if this is a credit (ie. net total < 0) or I if it's an invoice/debit
   */
  $transactionType () {
    return this.$netTotal() < 0 ? 'C' : 'I'
  }

  /**
   * creditNote method returns true if this is a credit (ie. net total < 0) or false if it's an invoice/debit
   */
  $creditNote () {
    return this.$transactionType() === 'C'
  }
}

module.exports = InvoiceModel
