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
      table.uuid('bill_run_id').notNullable()
      table.string('licence_number').notNullable()
      table.string('customer_reference').notNullable()
      table.integer('financial_year').notNullable()

      table.integer('credit_count').notNullable().defaultTo(0)
      table.bigInteger('credit_value').notNullable().defaultTo(0)

      table.integer('debit_count').notNullable().defaultTo(0)
      table.bigInteger('debit_value').notNullable().defaultTo(0)

      table.integer('zero_count').notNullable().defaultTo(0)

      table.integer('new_licence_count').notNullable().defaultTo(0)

      // There can only be 1 customer summary per invoice for a licence]
      // (note that each invoice is unique to a customer and financial year)
      table.unique(['invoice_id', 'licence_number'])

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
