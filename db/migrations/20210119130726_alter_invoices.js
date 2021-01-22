'use strict'

const tableName = 'invoices'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Add new column
      table.boolean('summarised').notNullable().defaultTo(false)
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Drop the columns we added
      table.dropColumn('summarised')
    })
}
