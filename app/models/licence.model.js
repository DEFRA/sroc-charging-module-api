'use strict'

/**
 * @module LicenceModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model')

class LicenceModel extends BaseModel {
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
   * Returns an array of column names that are used for the unique constraint which groups licences to invoices
   *
   * For each grouping of invoice ID and licence number in a bill run we generate a 'licence' and link the
   * relevant transactions to it.
   *
   * We need this information when adding transactions to help generate the 'UPSERT' query we use to either create the
   * licence record for the first time, or update it as requests are received.
   *
   * @returns {string[]} an array of field names
   */
  static get transactionConstraintFields () {
    return ['invoice_id', 'licence_number']
  }

  /**
   * Returns an object that contains the minimum (base) properties and values needed when inserting a new licence
   *
   * Built for when adding a transaction to a bill run. We also create an `licence` record for each invoice ID
   * and licence number grouping in a bill run. We need to do this as part of a PostgreSQL 'UPSERT' call in order to
   * support new concurrent requests for the same licence.
   *
   * It contains the base properties that must be set when the licence record is first inserted into the DB.
   *
   * @return {Object} object that can built on and used with an Objection or Knex `.insert()` call
   */
  static createBaseOnInsertObject (transaction) {
    return {
      billRunId: transaction.billRunId,
      invoiceId: transaction.invoiceId,
      licenceNumber: transaction.lineAttr1
    }
  }

  /**
   * netTotal method provides the net total of the licence (debit value - credit value)
   */
  $netTotal () {
    return this.debitLineValue - this.creditLineValue
  }
}

module.exports = LicenceModel
