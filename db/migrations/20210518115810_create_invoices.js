const tableName = 'invoices'

exports.up = async function (knex) {
  await knex
    .schema
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('bill_run_id').notNullable().references('bill_runs.id').onDelete('CASCADE')
      table.string('customer_reference').notNullable()
      table.integer('financial_year').notNullable()
      table.integer('credit_line_count').notNullable().defaultTo(0)
      table.bigInteger('credit_line_value').notNullable().defaultTo(0)
      table.integer('debit_line_count').notNullable().defaultTo(0)
      table.bigInteger('debit_line_value').notNullable().defaultTo(0)
      table.integer('zero_line_count').notNullable().defaultTo(0)
      table.integer('subject_to_minimum_charge_count').notNullable().defaultTo(0)
      table.bigInteger('subject_to_minimum_charge_credit_value').notNullable().defaultTo(0)
      table.bigInteger('subject_to_minimum_charge_debit_value').notNullable().defaultTo(0)
      table.boolean('zero_value_invoice').notNullable().defaultTo(false)
      table.boolean('deminimis_invoice').notNullable().defaultTo(false)
      table.boolean('minimum_charge_invoice').notNullable().defaultTo(false)
      table.string('transaction_reference')
      table.uuid('rebilled_invoice_id')
      table.string('rebilled_type').notNullable().defaultTo('O')

      // Add unique constraints
      table.unique(['bill_run_id', 'customer_reference', 'financial_year', 'rebilled_type'])

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
