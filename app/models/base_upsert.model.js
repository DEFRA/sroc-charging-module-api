'use strict'

/**
 * @module BaseUpsertModel
 */

const BaseModel = require('./base.model')

class BaseUpsertModel extends BaseModel {
  static async updateTally (transaction, trx) {
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

  static _baseOnInsertObject (_transaction) {
    throw new Error("Extending class must implement '_baseOnInsertObject()'")
  }

  static _onConflictContraints () {
    throw new Error("Extending class must implement '_onConflictContraints()'")
  }

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
