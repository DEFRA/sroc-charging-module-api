'use strict'

const tableName = 'transactions'
const columnName = 'bill_run_number'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Add column
      table.integer('bill_run_number)
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Drop the column we added
      table.dropColumn(columnName)
    })
}
