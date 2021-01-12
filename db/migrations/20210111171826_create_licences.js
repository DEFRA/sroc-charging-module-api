'use strict'

const tableName = 'licences'

exports.up = async function (knex) {
  await knex
    .schema
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('invoice_id').notNullable()
      table.string('line_attr1').notNullable() // Licence number is represented as line_attr1
      table.string('customer_reference').notNullable()
      table.integer('financial_year').notNullable()

      table.integer('credit_count').notNullable().defaultTo(0)
      table.bigInteger('credit_value').notNullable().defaultTo(0)

      table.integer('debit_count').notNullable().defaultTo(0)
      table.bigInteger('debit_value').notNullable().defaultTo(0)

      table.integer('zero_count').notNullable().defaultTo(0)

      table.integer('new_licence_count').notNullable().defaultTo(0)

      // There can only be 1 customer summary per invoice per financial year for a licence
      table.unique(['invoice_id', 'line_attr1', 'customer_reference', 'financial_year'])

      // Automatic timestamps
      table.timestamps(false, true)
    })

  await knex.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON ${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `)
}

exports.down = async function (knex) {
  return knex
    .schema
    .dropTableIfExists(tableName)
}
