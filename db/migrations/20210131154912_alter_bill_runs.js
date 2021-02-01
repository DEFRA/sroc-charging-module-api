'use strict'

const tableName = 'bill_runs'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Add minimum charge credit and debit value columns
      table.bigInteger('credit_note_count').notNullable().defaultTo(0)
      table.bigInteger('credit_note_value').notNullable().defaultTo(0)
      table.bigInteger('invoice_count').notNullable().defaultTo(0)
      table.bigInteger('invoice_value').notNullable().defaultTo(0)
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Drop added columns
      table.dropColumns(
        'credit_note_count',
        'credit_note_value',
        'invoice_count',
        'invoice_value'
      )
    })
}
