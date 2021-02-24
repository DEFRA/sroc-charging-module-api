'use strict'

const tableName = 'transactions'

// Alter licence_id column to reference licences.id.
// onDelete('CASCADE') ensures the transaction is automatically deleted when the licence it belongs to is deleted.
exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // alter() requires you list everything, not just the thing you are changing. This is why existing constraints
      // like notNullable() are listed as well. If we didn't, they would be dropped.
      table.uuid('licence_id')
        .notNullable()
        .references('licences.id')
        .onDelete('CASCADE')
        .alter()
    })
}

// Revert licence_id column to its original state
exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.uuid('licence_id')
        .notNullable()
        .alter()
    })
}
