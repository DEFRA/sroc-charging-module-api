'use strict'

const tableName = 'transactions'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Alter existing columns
      // alter() requires you list everything, not just the thing you are changing. This is why existing constraints
      // like notNullable() are listed as well. If we didn't, they would be dropped.
      table.bigInteger('charge_value').notNullable().alter()
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Revert alterations
      table.integer('charge_value').notNullable().alter()
    })
}
