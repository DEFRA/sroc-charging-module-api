// Adds the extension pgcrypto to the database
//
// We need this extension because in PostgreSQL 10 its the only way to access
// `gen_random_uuid()` which we use to generate our UUID's
//
// https://www.postgresql.org/docs/10/pgcrypto.html

export function up (knex) {
  return knex.raw(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `)
}

export function down (knex) {
  return knex.raw(`
    DROP EXTENSION IF EXISTS pgcrypto;
  `)
}
