'use strict'

const tableName = 'invoices'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Add new column
      table.boolean('minimum_charge_invoice').notNullable().defaultTo(false)
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Drop the column we added
      table.dropColumn('minimum_charge_invoice')
    })
}
