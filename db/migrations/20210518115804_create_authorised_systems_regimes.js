const tableName = 'authorised_systems_regimes'

export async function up (knex) {
  await knex
    .schema
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('authorised_system_id').notNullable()
      table.uuid('regime_id').notNullable()

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
