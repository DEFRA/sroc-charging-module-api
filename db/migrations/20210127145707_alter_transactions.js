'use strict'

const tableName = 'transactions'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Add unique constraint
      table.unique(['regime_id', 'client_id'])
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Remove unique constraint
      table.dropUnique(['regime_id', 'client_id'])
    })
}
