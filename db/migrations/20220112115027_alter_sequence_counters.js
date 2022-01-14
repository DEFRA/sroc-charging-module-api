'use strict'

const tableName = 'sequence_counters'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.integer('transaction_number_sroc').notNullable().defaultTo(0)
      table.renameColumn('transaction_number', 'transaction_number_presroc')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.dropColumns('transaction_number_sroc')
      table.renameColumn('transaction_number_presroc', 'transaction_number')
    })
}
