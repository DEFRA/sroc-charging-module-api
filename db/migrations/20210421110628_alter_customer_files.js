'use strict'

const tableName = 'customer_files'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.string('status').notNullable().defaultTo('initialised')
      table.date('export_date')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.dropColumns(
        'status',
        'export_date'
      )
    })
}
