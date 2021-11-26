'use strict'

/**
 * @module InvoiceModel
 */

const { Model } = require('objection')
const BaseUpsertModel = require('./base_upsert.model')

const DEMINIMIS_LIMIT = 500
// This is the value used for new invoices. Reason? To allow us to accept multiple rebill invoices with the same
// customer reference and financial year in the same bill run. It ensures the invoices table constraint works for new
// invoices, but when we rebill and actually have a rebill ID, the constraint doesn't trigger.
// Note - it has to be a valid UUID so we wanted a value that was clearly set rather than generated.
const REBILL_ID_PLACEHOLDER = '99999999-9999-9999-9999-999999999999'

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
       * minimum charge modifier selects all invoices where minimum charge applies.
       */
      minimumCharge (query) {
        query
          .where('subjectToMinimumChargeCreditValue', '>', 0)
          .orWhere('subjectToMinimumChargeDebitValue', '>', 0)
          .modify('originalInvoice')
      },

      /**
       * original invoice modifier selects all invoices where rebilledType is `O` (ie. excludes invoices generated as
       * part of the rebilling process where rebilledType is `C` or `R`)
       */
      originalInvoice (query) {
        query
          .where('rebilledType', 'O')
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
   * If `rebilledType` is passed through in the transaction then we use it; otherwise, we set it to 'O'. If
   * `rebilledInvoiceId` is passed through we also use it. Else we set it to `REBILL_ID_PLACEHOLDER` (currently
   * 99999999-9999-9999-9999-999999999999).
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
      financialYear: transaction.chargeFinancialYear,
      rebilledType: transaction.rebilledType ?? 'O',
      rebilledInvoiceId: transaction.rebilledInvoiceId ?? REBILL_ID_PLACEHOLDER
    }
  }

  /**
   * Returns an array of column names that are used for the unique constraint of an invoice to be UPSERT
   *
   * @returns {string[]} an array of the constraint field names
   */
  static _onConflictContraints () {
    return ['bill_run_id', 'customer_reference', 'financial_year', 'rebilled_type', 'rebilled_invoice_id']
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
   * originalInvoice method returns true if this is an original invoice or false if it was created by a rebilling
   * request
   */
  $originalInvoice () {
    return this.rebilledType === 'O'
  }

  /**
   * zeroValueInvoice method returns true if this is a zero value invoice
   */
  $zeroValueInvoice () {
    return this.debitLineValue - this.creditLineValue === 0
  }

  /**
   * deminimisInvoice method returns true if this is a deminimis invoice
   */
  $deminimisInvoice () {
    return (
      this.debitLineValue - this.creditLineValue > 0 &&
      this.debitLineValue - this.creditLineValue < DEMINIMIS_LIMIT &&
      this.$originalInvoice()
    )
  }
}

module.exports = InvoiceModel
