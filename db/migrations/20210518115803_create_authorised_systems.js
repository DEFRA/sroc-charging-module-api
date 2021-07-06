const tableName = 'authorised_systems'

export async function up (knex) {
  await knex
    .schema
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('client_id').notNullable()
      table.string('name').notNullable()
      table.string('status').notNullable().defaultTo('active')
      table.boolean('admin').notNullable().defaultTo(false)

      // Add unique constraints
      table.unique('client_id')
      table.unique('name')

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

export function down (knex) {
  return knex
    .schema
    .dropTableIfExists(tableName)
}
