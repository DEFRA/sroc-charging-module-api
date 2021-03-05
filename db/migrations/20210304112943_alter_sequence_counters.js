'use strict'

const tableName = 'sequence_counters'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Add column
      table.integer('transaction_number').notNullable().defaultTo(0)
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Drop the column we added
      table.dropColumn('transaction_number')
    })
}
