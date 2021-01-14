'use strict'

const tableName = 'bill_runs'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Add new columns
      table.integer('credit_count').notNullable().defaultTo(0)
      table.bigInteger('credit_value').notNullable().defaultTo(0)

      table.integer('debit_count').notNullable().defaultTo(0)
      table.bigInteger('debit_value').notNullable().defaultTo(0)

      table.integer('zero_count').notNullable().defaultTo(0)

      table.integer('new_licence_count').notNullable().defaultTo(0)
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Drop the columns we added
      table.dropColumns(
        'credit_count',
        'credit_value',
        'debit_count',
        'debit_value',
        'zero_count',
        'new_licence_count'
      )
    })
}
