'use strict'

const tableName = 'invoices'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.dropUnique(['bill_run_id', 'customer_reference', 'financial_year', 'rebilled_type'])
      table.unique(['bill_run_id', 'customer_reference', 'financial_year', 'rebilled_type', 'rebilled_invoice_id'])
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.dropUnique(['bill_run_id', 'customer_reference', 'financial_year', 'rebilled_type', 'rebilled_invoice_id'])
      table.unique(['bill_run_id', 'customer_reference', 'financial_year', 'rebilled_type'])
    })
}
