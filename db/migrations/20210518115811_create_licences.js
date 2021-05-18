'use strict'

const tableName = 'licences'

exports.up = async function (knex) {
  await knex
    .schema
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('invoice_id').notNullable().references('invoices.id').onDelete('CASCADE')
      table.uuid('bill_run_id').notNullable()
      table.string('licence_number').notNullable()
      table.integer('credit_line_count').notNullable().defaultTo(0)
      table.bigInteger('credit_line_value').notNullable().defaultTo(0)
      table.integer('debit_line_count').notNullable().defaultTo(0)
      table.bigInteger('debit_line_value').notNullable().defaultTo(0)
      table.integer('zero_line_count').notNullable().defaultTo(0)
      table.integer('subject_to_minimum_charge_count').notNullable().defaultTo(0)
      table.bigInteger('subject_to_minimum_charge_credit_value').notNullable().defaultTo(0)
      table.bigInteger('subject_to_minimum_charge_debit_value').notNullable().defaultTo(0)

      // Add unique constraints
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
