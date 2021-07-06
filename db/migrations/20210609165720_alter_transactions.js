const tableName = 'transactions'

export async function up (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.uuid('rebilled_transaction_id')
    })
}

export async function down (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.dropColumns('rebilled_transaction_id')
    })
}
