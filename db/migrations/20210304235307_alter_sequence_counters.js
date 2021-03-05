'use strict'

const tableName = 'sequence_counters'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Add column
      table.integer('file_number').notNullable().defaultTo(50000)
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Drop the column we added
      table.dropColumn('file_number')
    })
}
