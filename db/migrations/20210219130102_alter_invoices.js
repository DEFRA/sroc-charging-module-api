'use strict'

const tableName = 'invoices'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.renameColumn('credit_count', 'credit_line_count')
      table.renameColumn('credit_value', 'credit_line_value')
      table.renameColumn('debit_count', 'debit_line_count')
      table.renameColumn('debit_value', 'debit_line_value')
      table.renameColumn('zero_count', 'zero_line_count')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.renameColumn('credit_line_count', 'credit_count')
      table.renameColumn('credit_line_value', 'credit_value')
      table.renameColumn('debit_line_count', 'debit_count')
      table.renameColumn('debit_line_value', 'debit_value')
      table.renameColumn('zero_line_count', 'zero_count')
    })
}
