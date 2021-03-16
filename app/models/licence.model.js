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

  static async transactionTallyUpsert (transaction, trx = null) {
    const { CreateTransactionTallyService } = require('../services')

    const tallyObject = CreateTransactionTallyService.go(transaction, this.tableName)
    Object.assign(tallyObject.insertData, this._baseOnInsertObject(transaction))

    const sql = `${LicenceModel.knexQuery().insert(tallyObject.insertData).toQuery()}
      ON CONFLICT (invoice_id, licence_number)
      DO UPDATE SET ${tallyObject.updateStatements.join(', ')}
      RETURNING id;`

    const result = await this._applyUpsert(sql, trx)

    return result.rows[0].id
  }

  /**
   * netTotal method provides the net total of the licence (debit value - credit value)
   */
  $netTotal () {
    return this.debitLineValue - this.creditLineValue
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
  static _baseOnInsertObject (transaction) {
    return {
      billRunId: transaction.billRunId,
      invoiceId: transaction.invoiceId,
      licenceNumber: transaction.lineAttr1
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
      result = await LicenceModel.knex().raw(sql).transacting(trx)
    } else {
      result = await LicenceModel.knex().raw(sql)
    }

    return result
  }
}

module.exports = LicenceModel
