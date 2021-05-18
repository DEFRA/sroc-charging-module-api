'use strict'

// Delete transaction_type, transaction_reference and deminimis columns from transactions table
// Add transaction_reference column to invoices table
exports.up = async function (knex) {
  await knex
    .schema
    .alterTable('invoices', table => {
      table.string('transaction_reference')
    })
}

// Re-add transaction_type, transaction_reference and deminimis columns to transactions table
// Delete transaction_reference column from invoices table
exports.down = async function (knex) {
  await knex
    .schema
    .alterTable('invoices', table => {
      table.dropColumn('transaction_reference')
    })
}
