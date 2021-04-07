'use strict'

const tableName = 'transactions'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Drop the redundant field
      table.dropColumns('status')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Add dropped field
      table.string('status').defaultTo('unbilled').notNullable()
    })
}
