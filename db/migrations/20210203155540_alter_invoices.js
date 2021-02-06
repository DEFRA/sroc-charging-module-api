'use strict'

const tableName = 'invoices'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Delete summarised column
      table.dropColumn('summarised')

      // Add new columns
      table.boolean('zero_value_invoice').notNullable().defaultTo(false)
      table.boolean('deminimis_invoice').notNullable().defaultTo(false)
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Drop the columns we added
      table.dropColumn('zero_value_invoice')
      table.dropColumn('deminimis_invoice')

      // Re-add summarised column
      table.boolean('summarised').notNullable().defaultTo(false)
    })
}
