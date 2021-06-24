const tableName = 'transactions'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.uuid('rebilled_transaction_id')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      table.dropColumns('rebilled_transaction_id')
    })
}
