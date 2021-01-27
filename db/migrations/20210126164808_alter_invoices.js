'use strict'

const tableName = 'invoices'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Rename 'new_licence_count' to 'subject_to_minimum_charge_count'
      table.renameColumn('new_licence_count', 'subject_to_minimum_charge_count')

      // Add minimum charge credit and debit value columns
      table.bigInteger('subject_to_minimum_charge_credit_value').notNullable().defaultTo(0)
      table.bigInteger('subject_to_minimum_charge_debit_value').notNullable().defaultTo(0)
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Rename column back
      table.renameColumn('subject_to_minimum_charge_count', 'new_licence_count')

      // Drop added columns
      table.dropColumns(
        'subject_to_minimum_charge_credit_value',
        'subject_to_minimum_charge_debit_value'
      )
    })
}
