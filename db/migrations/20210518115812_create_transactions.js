const tableName = 'transactions'

exports.up = async function (knex) {
  await knex
    .schema
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('bill_run_id').notNullable()
      table.bigInteger('charge_value').notNullable()
      table.boolean('charge_credit').notNullable().defaultTo(false)
      table.uuid('created_by').notNullable()
      table.uuid('regime_id').notNullable()
      table.string('ruleset').notNullable()
      table.date('transaction_date')
      table.boolean('subject_to_minimum_charge').defaultTo(false).notNullable()
      table.boolean('minimum_charge_adjustment').defaultTo(false).notNullable()
      table.boolean('net_zero_value_invoice').defaultTo(false).notNullable()
      table.string('customer_reference')
      table.string('client_id')
      table.string('region')
      table.string('line_area_code')
      table.string('line_description')
      table.date('charge_period_start')
      table.date('charge_period_end')
      table.integer('charge_financial_year')
      table.string('header_attr_1')
      table.string('header_attr_2')
      table.string('header_attr_3')
      table.string('header_attr_4')
      table.string('header_attr_5')
      table.string('header_attr_6')
      table.string('header_attr_7')
      table.string('header_attr_8')
      table.string('header_attr_9')
      table.string('header_attr_10')
      table.string('line_attr_1')
      table.string('line_attr_2')
      table.string('line_attr_3')
      table.string('line_attr_4')
      table.string('line_attr_5')
      table.string('line_attr_6')
      table.string('line_attr_7')
      table.string('line_attr_8')
      table.string('line_attr_9')
      table.string('line_attr_10')
      table.string('line_attr_11')
      table.string('line_attr_12')
      table.string('line_attr_13')
      table.string('line_attr_14')
      table.string('line_attr_15')
      table.string('regime_value_1')
      table.string('regime_value_2')
      table.string('regime_value_3')
      table.string('regime_value_4')
      table.string('regime_value_5')
      table.string('regime_value_6')
      table.string('regime_value_7')
      table.string('regime_value_8')
      table.string('regime_value_9')
      table.string('regime_value_10')
      table.string('regime_value_11')
      table.string('regime_value_12')
      table.string('regime_value_13')
      table.string('regime_value_14')
      table.string('regime_value_15')
      table.string('regime_value_16')
      table.string('regime_value_17')
      table.string('regime_value_18')
      table.string('regime_value_19')
      table.string('regime_value_20')
      table.json('charge_calculation')
      table.uuid('invoice_id').notNullable()
      table.uuid('licence_id').notNullable().references('licences.id').onDelete('CASCADE')

      // Add unique constraints
      table.unique(['regime_id', 'client_id'])

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
