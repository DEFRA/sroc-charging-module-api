'use strict'

const tableName = 'invoices'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.uuid('rebilled_invoice_id')
      table.string('rebilled_type').notNullable().defaultTo('O')
      table.dropUnique(['bill_run_id', 'customer_reference', 'financial_year'])
      table.unique(['bill_run_id', 'customer_reference', 'financial_year', 'rebilled_type'])
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.dropUnique(['bill_run_id', 'customer_reference', 'financial_year', 'rebilled_type'])
      // Drop added columns
      table.dropColumns(
        'rebilled_invoice_id',
        'rebilled_type'
      )
      table.unique(['bill_run_id', 'customer_reference', 'financial_year'])
    })
}
