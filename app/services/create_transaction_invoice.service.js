'use strict'

/**
 * @module CreateTransactionInvoiceService
 */

const { InvoiceModel } = require('../models')
const { transaction } = require('../models/base.model')
const CreateTransactionTallyService = require('./create_transaction_tally.service')

class CreateTransactionInvoiceService {
  static async go (transaction, trx) {
    const id = await this._update(transaction, trx)

    return id
  }

  static async _update (transaction, trx) {
    const insertRecord = this._generateInsertRecord(transaction)
    const insertSql = InvoiceModel.knexQuery().insert(insertRecord).toQuery()
    const updateSql = await this._generatePatch(transaction)

    const result = await InvoiceModel.knex().raw(
      `${insertSql}
      ON CONFLICT (bill_run_id, customer_reference, financial_year)
      DO UPDATE SET
      ${updateSql}
      RETURNING id;`
    ).transacting(trx)

    return result.rows[0].id
  }

  static _generateInsertRecord (transaction) {
    const record = {
      billRunId: transaction.billRunId,
      customerReference: transaction.customerReference,
      financialYear: transaction.chargeFinancialYear
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
    return await CreateTransactionTallyService.go(transaction, InvoiceModel.tableName)
  }
}

module.exports = CreateTransactionInvoiceService
