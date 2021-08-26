'use strict'

const tableName = 'bill_runs'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.string('ruleset').defaultTo('sroc')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.dropColumns('ruleset')
    })
}
