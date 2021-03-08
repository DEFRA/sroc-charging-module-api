'use strict'

/**
 * @module CreateTransactionTallyService
 */

class CreateTransactionTallyService {
  static async go (transactionToBeTallied, tableName) {
    return this._generatePatch(transactionToBeTallied, tableName)
  }

  static _generatePatch (transaction, tableName) {
    const updates = []

    if (transaction.chargeCredit) {
      updates.push(`credit_line_count = ${tableName}.credit_line_count + EXCLUDED.credit_line_count`)
      updates.push(`credit_line_value = ${tableName}.credit_line_value + EXCLUDED.credit_line_value`)
    } else if (transaction.chargeValue === 0) {
      updates.push(`zero_line_count = ${tableName}.zero_line_count + EXCLUDED.zero_line_count`)
    } else {
      updates.push(`debit_line_count = ${tableName}.debit_line_count + EXCLUDED.debit_line_count`)
      updates.push(`debit_line_value = ${tableName}.debit_line_value + EXCLUDED.debit_line_value`)
    }

    if (transaction.subjectToMinimumCharge) {
      updates.push(
        `subject_to_minimum_charge_count = ${tableName}.subject_to_minimum_charge_count + EXCLUDED.subject_to_minimum_charge_count`
      )

      if (transaction.chargeCredit) {
        updates.push(
          `subject_to_minimum_charge_credit_value = ${tableName}.subject_to_minimum_charge_credit_value + EXCLUDED.subject_to_minimum_charge_credit_value`
        )
      } else if (transaction.chargeValue !== 0) {
        updates.push(
          `subject_to_minimum_charge_debit_value = ${tableName}.subject_to_minimum_charge_debit_value + EXCLUDED.subject_to_minimum_charge_debit_value`
        )
      }
    }

    return updates.join(', ')
  }
}

module.exports = CreateTransactionTallyService
