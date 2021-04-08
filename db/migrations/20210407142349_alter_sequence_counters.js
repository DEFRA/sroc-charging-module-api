'use strict'

const tableName = 'sequence_counters'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.integer('customer_file_number').notNullable().defaultTo(50000)
      table.renameColumn('file_number', 'transaction_file_number')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.dropColumn('customer_file_number')
      table.renameColumn('transaction_file_number', 'file_number')
    })
}
