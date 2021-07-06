const tableName = 'sequence_counters'

export async function up (knex) {
  await knex
    .schema
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('regime_id').notNullable()
      table.string('region').notNullable()
      table.integer('bill_run_number').notNullable().defaultTo(10000)
      table.integer('transaction_number').notNullable().defaultTo(0)
      table.integer('transaction_file_number').notNullable().defaultTo(50000)
      table.integer('customer_file_number').notNullable().defaultTo(50000)

      // Set unique constraint
      table.unique(['regime_id', 'region'])

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

export async function down (knex) {
  return knex
    .schema
    .dropTableIfExists(tableName)
}
