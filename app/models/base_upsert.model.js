'use strict'

/**
 * @module BaseUpsertModel
 */

const BaseModel = require('./base.model')

class BaseUpsertModel extends BaseModel {
  /**
   * Run an UPSERT query against the DB for the model that extends this class
   *
   * The transactions added to a bill run are grouped by customer reference and financial year. Each grouping is an
   * 'invoice'. As transactions are added we need to either
   *
   * - create a new `invoice` if none with a matching bill run ID, customer reference and financial year exists
   * - if a matching `invoice` does exist update its 'tally' fields
   *
   * By tally fields we mean fields like `creditLineCount` and `debitLineValue`, which are updated for every transaction
   * added.
   *
   * We do this with a {@link https://www.postgresql.org/docs/current/sql-insert.html|PosgreSQL UPSERT query}. An UPSERT
   * is essentially 'try inserting these values but if the record already exists update these instead'.
   *
   * So, it covers both scenarios listed above. It is also supports concurrency. If a client system sends 4 create
   * transaction requests simulatenously one will succeed inserting the new record. The rest will safely fall back on
   * updating the it.
   *
   * Currently, the `InvoiceModel` and `LicenceModel` have to be inserted or updated as transactions are added so need
   * UPSERT support.
   *
   * @param {module:TransactionTranslator} transaction translator representing the transaction that will seed the upsert
   * query
   * @param {Object} [trx] Optional Objection database `transaction` object to be used in the upsert query
   *
   * @returns {string} id of the record created or updated
   */
  static async updateTally (transaction, trx = null) {
    const { CreateTransactionTallyService } = require('../services')

    const tallyObject = CreateTransactionTallyService.go(transaction, this.tableName)
    Object.assign(tallyObject.insertData, this._baseOnInsertObject(transaction))

    const sql = `${this.knexQuery().insert(tallyObject.insertData).toQuery()}
      ON CONFLICT (${this._onConflictContraints().join(', ')})
      DO UPDATE SET ${tallyObject.updateStatements.join(', ')}
      RETURNING id;`

    const result = await this._applyUpsert(sql, trx)

    return result.rows[0].id
  }

  /**
   * Returns an object that contains the minimum (base) properties and values needed when inserting a new record
   *
   * > ***Extending classes must override this method!***
   *
   * For example, in an invoice each grouping of customer reference and financial year in a bill run will result in a
   * new 'invoice'. This means when 'inserting' a new invoice record we always need to set
   *
   * - the bill run id
   * - the customer reference
   * - the financial year
   *
   * `InvoiceModel._baseOnInsertObject(transaction)` will extract them from the transaction and return them as an object
   * we can then assign additional properties to. These will be based on the type of transaction, so can change for each
   * new invoice.
   *
   * It contains the base properties that must be set when the invoice record is first inserted into the DB.
   *
   * @param {module:TransactionTranslator} transaction translator representing the transaction that will seed the new
   * record
   *
   * @return {Object} object that can built on and used with an Objection or Knex `.insert(myObject)` call
   */
  static _baseOnInsertObject (_transaction) {
    throw new Error("Extending class must implement '_baseOnInsertObject()'")
  }

  /**
   * Returns an array of column names in snake_case that are used for the unique constraint of the record to be UPSERT
   *
   * > ***Extending classes must override this method!***
   *
   * In an invoice, for example, each grouping of customer reference and financial year in a bill run will result in a
   * new 'invoice'.
   *
   * We need this information to help generate the 'UPSERT' query we use.
   *
   * **IMPORTANT!!** The columns names _must_ be declared as snake_case. This is because they will be used in a Knex
   * `raw()` query and will bypass the mappers we have enabled.
   *
   * @returns {string[]} an array of the constraint field names
   */
  static _onConflictContraints () {
    throw new Error("Extending class must implement '_onConflictContraints()'")
  }

  /**
   * Apply the PostgreSQL UPSERT query generated in `updateTally()`
   *
   * {@link https://vincit.github.io/objection.js/guide/transactions.html|Objection} can handle us passing in a `null`
   * value to `query()`. This makes testing of services easy because in the app we can pass through a transaction
   * object but in our unit tests we can just leave it blank. The query still gets run, the database gets updated, and
   * our tests pass.
   *
   * We've had to resort to generating our own 'upsert' query and rely on `Knex.raw()` because it doesn't support
   * incrementing existing fields in its upsert implementation. Unfortunately, Knex throws an error if the object passed
   * to `transacting()` is not a valid transaction.
   *
   * So, we've had to create this function to support our unit testing and avoid the need to generate Knex transaction
   * instances in tests.
   *
   * @param {string} sql UPSERT SQL statement that will be used in the `knex().raw()` call
   * @param {object} trx the transaction instance to use if query is to be called within one, else 'null'
   *
   * @returns {Object} object that holds the result of the Knex call
   */
  static async _applyUpsert (sql, trx) {
    let result

    if (trx) {
      result = await this.knex().raw(sql).transacting(trx)
    } else {
      result = await this.knex().raw(sql)
    }

    return result
  }
}

module.exports = BaseUpsertModel
