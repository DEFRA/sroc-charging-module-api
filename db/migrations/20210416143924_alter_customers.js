'use strict'

const tableName = 'customers'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.uuid('customer_file_id')
        .references('customer_files.id')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.dropColumn('customer_file_id')
    })
}
