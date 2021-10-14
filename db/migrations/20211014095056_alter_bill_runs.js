'use strict'

const tableName = 'bill_runs'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // We want to create a ruleset column with the value `presroc` for all existing entries in the table. However in
      // future we want new entries to default to `sroc`. We therefore set the default twice.
      table.string('ruleset').defaultTo('presroc')
      table.string('ruleset').alter().defaultTo('sroc')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.dropColumns('ruleset')
    })
}
