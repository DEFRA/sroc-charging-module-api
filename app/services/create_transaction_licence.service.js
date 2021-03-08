'use strict'

const { transaction } = require('objection')
/**
 * @module CreateTransactionLicenceService
 */

const { LicenceModel } = require('../models')
const CreateTransactionTallyService = require('./create_transaction_tally.service')

class CreateTransactionLicenceService {
  static async go (transaction, trx = null) {
    const id = await this._update(transaction, trx)

    return id
  }

  static async _update (transaction, trx) {
    const insertRecord = this._generateInsertRecord(transaction)
    const insertSql = LicenceModel.knexQuery().insert(insertRecord).toQuery()
    const updateSql = await this._generatePatch(transaction)

    const result = await LicenceModel.knex().raw(
      `${insertSql}
      ON CONFLICT (invoice_id, licence_number)
      DO UPDATE SET
      ${updateSql}
      RETURNING id;`
    ).transacting(trx)

    return result.rows[0].id
  }

  static _generateInsertRecord (transaction) {
    const record = {
      billRunId: transaction.billRunId,
      invoiceId: transaction.invoiceId,
      licenceNumber: transaction.lineAttr1
    }

    if (transaction.chargeCredit) {
      record.creditLineCount = 1
      record.creditLineValue = transaction.chargeValue
    } else if (transaction.chargeValue === 0) {
      record.zeroLineCount = 1
    } else {
      record.debitLineCount = 1
      record.debitLineValue = transaction.chargeValue
    }

    if (transaction.subjectToMinimumCharge) {
      record.subjectToMinimumChargeCount = 1

      if (transaction.chargeCredit) {
        record.subjectToMinimumChargeCreditValue = transaction.chargeValue
      } else if (transaction.chargeValue !== 0) {
        record.subjectToMinimumChargeDebitValue = transaction.chargeValue
      }
    }

    return record
  }

  static async _generatePatch (transaction) {
    return await CreateTransactionTallyService.go(transaction, LicenceModel.tableName)
  }
}

module.exports = CreateTransactionLicenceService
