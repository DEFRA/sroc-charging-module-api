'use strict'

const tableName = 'customers'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Add unique constraint
      table.unique(['customer_reference'])
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Remove unique constraint
      table.dropUnique(['customer_reference'])
    })
}
