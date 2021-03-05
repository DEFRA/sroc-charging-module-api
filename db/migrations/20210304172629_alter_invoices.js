'use strict'

const tableName = 'invoices'

// Alter bill_run_id column to reference bill_runs.id.
// onDelete('CASCADE') ensures the invoice is automatically deleted when the bill run it belongs to is deleted.
exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // alter() requires you list everything, not just the thing you are changing. This is why existing constraints
      // like notNullable() are listed as well. If we didn't, they would be dropped.
      table.uuid('bill_run_id')
        .notNullable()
        .references('bill_runs.id')
        .onDelete('CASCADE')
        .alter()
    })
}

// Revert bill_run_id column to its original state
exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.uuid('bill_run_id')
        .notNullable()
        .alter()
    })
}
