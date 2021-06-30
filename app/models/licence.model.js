/**
 * @module LicenceModel
 */

import { Model } from 'objection'

import BaseUpsertModel from './base_upsert.model.js'
import BillRunModel from './bill_run.model.js'
import InvoiceModel from './invoice.model.js'
import TransactionModel from './transaction.model.js'

export default class LicenceModel extends BaseUpsertModel {
  static get tableName () {
    return 'licences'
  }

  static get relationMappings () {
    return {
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: BillRunModel,
        join: {
          from: 'licences.billRunId',
          to: 'billRuns.id'
        }
      },
      invoice: {
        relation: Model.BelongsToOneRelation,
        modelClass: InvoiceModel,
        join: {
          from: 'licences.invoiceId',
          to: 'invoices.id'
        }
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: TransactionModel,
        join: {
          from: 'licences.id',
          to: 'transactions.licenceId'
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
