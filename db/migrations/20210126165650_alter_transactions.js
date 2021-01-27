'use strict'

const tableName = 'transactions'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Rename 'new_licence' to 'minimum_charge'
      table.renameColumn('new_licence', 'subject_to_minimum_charge')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Rename column back
      table.renameColumn('subject_to_minimum_charge', 'new_licence')
    })
}
