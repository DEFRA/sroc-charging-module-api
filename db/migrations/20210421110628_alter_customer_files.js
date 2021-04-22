'use strict'

const tableName = 'customer_files'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.string('status').notNullable().defaultTo('initialised')
      table.dateTime('exported_at')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.dropColumns(
        'status',
        'exported_at'
      )
    })
}
