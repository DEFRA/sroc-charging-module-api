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

  static async transactionTallyUpsert (transaction, trx = null) {
    const { CreateTransactionTallyService } = require('../services')

    const tallyObject = CreateTransactionTallyService.go(transaction, this.tableName)
    Object.assign(tallyObject.insertData, this._baseOnInsertObject(transaction))

    const sql = `${InvoiceModel.knexQuery().insert(tallyObject.insertData).toQuery()}
      ON CONFLICT (bill_run_id, customer_reference, financial_year)
      DO UPDATE SET ${tallyObject.updateStatements.join(', ')}
      RETURNING id;`

    const result = await this._applyUpsert(sql, trx)

    return result.rows[0].id
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

  /**
   * Returns an object that contains the minimum (base) properties and values needed when inserting a new invoice
   *
   * Built for when adding a transaction to a bill run. We also create an `invoice` record for each customer reference
   * and financial year grouping in a bill run. We need to do this as part of a PostgreSQL 'UPSERT' call in order to
   * support new concurrent requests for the same invoice.
   *
   * It contains the base properties that must be set when the invoice record is first inserted into the DB.
   *
   * @return {Object} object that can built on and used with an Objection or Knex `.insert()` call
   */
  static _baseOnInsertObject (transaction) {
    return {
      billRunId: transaction.billRunId,
      customerReference: transaction.customerReference,
      financialYear: transaction.chargeFinancialYear
    }
  }

  /**
   * Apply the PostgreSQL 'upsert' query generated in `transactionTallyUpsert()`
   *
   * {@link https://vincit.github.io/objection.js/guide/transactions.html|Objection} can handle us passing in a `null`
   * value to `query()`. This makes testing of services easy because in the app we can pass through a transaction
   * object but in our unit tests we can just leave it blank. The query still gets run, the database updated, and our
   * tests pass.
   *
   * We've had to resort to generating our own 'upsert' query and rely on `Knex.raw()` because it doesn't support
   * incrementing existing fields in the update. We've also found Knex throws an error if the transaction object passed
   * to `transacting()` is not a valid transaction.
   *
   * So, we've had to create this function to support our unit testing and avoid the need to generate Knex transaction
   * instances in the tests.
   *
   * @param {string} sql Upsert SQL statement that will be used in the `knex().raw()` call
   * @param {object} trx the transaction instance to use if query is to be called within one, else 'null'
   *
   * @returns {Object} object that holds the result of the Knex call
   */
  static async _applyUpsert (sql, trx) {
    let result

    if (trx) {
      result = await InvoiceModel.knex().raw(sql).transacting(trx)
    } else {
      result = await InvoiceModel.knex().raw(sql)
    }

    return result
  }
}

module.exports = InvoiceModel
