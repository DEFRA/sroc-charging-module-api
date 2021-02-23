'use strict'

const tableName = 'licences'

// Alter invoice_id column to reference invoices.id.
// onDelete('CASCADE') ensures the licence is automatically deleted when the invoice it belongs to is deleted.
exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // alter() requires you list everything, not just the thing you are changing. This is why existing constraints
      // like notNullable() are listed as well. If we didn't, they would be dropped.
      table.uuid('invoice_id')
        .notNullable()
        .references('invoices.id')
        .onDelete('CASCADE')
        .alter()
    })
}

// Revert invoice_id column to its original state
exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.uuid('invoice_id')
        .notNullable()
        .alter()
    })
}
