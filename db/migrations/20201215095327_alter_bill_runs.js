'use strict'

const tableName = 'bill_runs'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Add column
      table.integer('bill_run_number')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Drop the column we added
      table.dropColumn('bill_run_number')
    })
}
