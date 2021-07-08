'use strict'

const tableName = 'invoices'

/**
 * Added to allow multiple invoices with the same customer reference and financial year to be rebilled within the same
 * bill run.
 *
 * Scenario: Customer T12345 gets invoiced twice in 2020 on 2 separate bill runs (so 2 different invoices). Both went to
 * the wrong address so they need to be rebilled on a new, 3rd bill run.
 *
 * Prior to this change a unique constraint error would be thrown because we'd be attempting to add two invoices with
 * the same rebill type, customer ref., financial year and bill run ID. Adding `rebilled_invoice_id` to the constraint
 * means the DB no longer sees them as a duplicate.
 *
 * For reference because it's relevant, this is an issue for new (rebill type 'O') invoices. We have no rebill invoice
 * ID to set. If we leave the field `null` it breaks the constraint in a different way, in that it creates a new invoice
 * for _every_ transaction added. We rely on the constraint firing in this scenario so that our 'ON CONFLICT' query
 * triggers and the existing invoice is updated (see the Tally services and functions).
 *
 * So, for new invoices the value defaults to '99999999-9999-9999-9999-999999999999'. This is done in the invoice model
 * rather than the DB (as a column default).
 */
exports.up = async function (knex) {
  // Update any existing invoice records with our placeholder value so they will behave and have the same data as any
  // new invoices we create
  await knex('invoices')
    .where({ rebilled_type: 'O' })
    .update({ rebilled_invoice_id: '99999999-9999-9999-9999-999999999999' })

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

  // Reset all the rebilled_invoice_id fields to null
  await knex('invoices')
    .where({ rebilled_type: 'O' })
    .update({ rebilled_invoice_id: null })
}
