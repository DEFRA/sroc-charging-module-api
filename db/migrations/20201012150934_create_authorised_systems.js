'use strict'

const tableName = 'authorised_systems'

exports.up = async function (knex) {
  await knex
    .schema
    .createTable(tableName, table => {
      // Primary Key
      table.string('id').primary()

      // Data
      table.string('name').notNullable()
      table.string('status').notNullable().defaultTo('active')
      table.boolean('admin').defaultTo(false)

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

exports.down = function (knex) {
  return knex
    .schema
    .dropTableIfExists(tableName)
}
