'use strict'

const tableName = 'authorised_systems'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Add client_id unique constraint
      table.unique('client_id')
    })

  await knex
    .schema
    .alterTable(tableName, table => {
      // Add name unique constraint
      table.unique('name')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Drop client_id unique constraint
      table.unique('client_id')
    })

  await knex
    .schema
    .alterTable(tableName, table => {
      // Drop name unique constraint
      table.dropUnique('name')
    })
}
