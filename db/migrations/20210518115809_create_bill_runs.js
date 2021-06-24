const tableName = 'bill_runs'

exports.up = async function (knex) {
  await knex
    .schema
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('regime_id').notNullable()
      table.string('region').notNullable()
      table.string('status').notNullable().defaultTo('initialised')
      table.integer('bill_run_number')
      table.string('file_reference')
      table.integer('credit_note_count').notNullable().defaultTo(0)
      table.bigInteger('credit_note_value').notNullable().defaultTo(0)
      table.integer('invoice_count').notNullable().defaultTo(0)
      table.bigInteger('invoice_value').notNullable().defaultTo(0)
      table.integer('credit_line_count').notNullable().defaultTo(0)
      table.bigInteger('credit_line_value').notNullable().defaultTo(0)
      table.integer('debit_line_count').notNullable().defaultTo(0)
      table.bigInteger('debit_line_value').notNullable().defaultTo(0)
      table.integer('zero_line_count').notNullable().defaultTo(0)
      table.integer('subject_to_minimum_charge_count').notNullable().defaultTo(0)
      table.bigInteger('subject_to_minimum_charge_credit_value').notNullable().defaultTo(0)
      table.bigInteger('subject_to_minimum_charge_debit_value').notNullable().defaultTo(0)
      table.uuid('created_by').notNullable()

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
