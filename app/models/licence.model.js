/**
 * @module LicenceModel
 */

const { Model } = require('objection')
const BaseUpsertModel = require('./base_upsert.model')

class LicenceModel extends BaseUpsertModel {
  static get tableName () {
    return 'licences'
  }

  static get relationMappings () {
    return {
      invoice: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'invoice.model',
        join: {
          from: 'licences.invoiceId',
          to: 'invoices.id'
        }
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: 'transaction.model',
        join: {
          from: 'licences.id',
          to: 'transactions.licenceId'
        }
      },
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill_run.model',
        join: {
          from: 'licences.billRunId',
          to: 'billRuns.id'
        }
      }
    }
  }

  /**
   * Returns an object that contains the minimum (base) properties and values needed when inserting a new record
   *
   * See `BaseUpsertModel._baseOnInsertObject()` for more details
   *
   * @param {module:TransactionTranslator} transaction translator representing the transaction that will seed the new
   * licence
   *
   * @return {Object} object that can built on and used with an Objection or Knex `.insert(myObject)` call
   */
  static _baseOnInsertObject (transaction) {
    return {
      billRunId: transaction.billRunId,
      invoiceId: transaction.invoiceId,
      licenceNumber: transaction.lineAttr1
    }
  }

  /**
   * Returns an array of column names that are used for the unique constraint of a licence to be UPSERT
   *
   * @returns {string[]} an array of the constraint field names
   */
  static _onConflictContraints () {
    return ['invoice_id', 'licence_number']
  }

  /**
   * netTotal method provides the net total of the licence (debit value - credit value)
   */
  $netTotal () {
    return this.debitLineValue - this.creditLineValue
  }
}

module.exports = LicenceModel
