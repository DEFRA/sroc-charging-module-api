'use strict'

const tableName = 'bill_runs'
const columnName = 'bill_run_number'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Add column
      table.integer(columnName)
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
