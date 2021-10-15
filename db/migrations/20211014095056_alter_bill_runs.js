'use strict'

const tableName = 'bill_runs'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // We want to create a ruleset column with the value `presroc` for all existing entries in the table. However in
      // future we simply want this column to be not nullable. We therefore set the default, then alter it straight away
      // (which, as we aren't stating a default, will remove it).
      table.string('ruleset').defaultTo('presroc')
      table.string('ruleset').alter().notNullable()
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.dropColumns('ruleset')
    })
}
