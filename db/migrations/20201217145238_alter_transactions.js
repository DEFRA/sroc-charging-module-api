'use strict'

const tableName = 'transactions'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Alter existing columns
      // alter() requires you list everything, not just the thing you are changing. This is why existing constraints
      // like notNullable() are listed as well. If we didn't, they would be dropped.
      table.boolean('charge_credit').defaultTo(false).notNullable().alter()

      // Add new columns
      table.uuid('created_by').notNullable()
      table.uuid('regime_id').notNullable()
      table.string('ruleset').notNullable()
      table.string('status').defaultTo('unbilled').notNullable()
      table.date('transaction_date')
      table.string('transaction_type')
      table.string('transaction_reference')
      table.boolean('new_licence').defaultTo(false).notNullable()
      table.boolean('minimum_charge_adjustment').defaultTo(false).notNullable()
      table.boolean('deminimis').defaultTo(false).notNullable()
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
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Revert alterations
      table.boolean('charge_credit').notNullable().alter()

      // Drop the columns we added
      table.dropColumns(
        'created_by',
        'regime_id',
        'ruleset',
        'status',
        'transaction_date',
        'transaction_type',
        'transaction_reference',
        'new_licence',
        'minimum_charge_adjustment',
        'deminimis',
        'net_zero_value_invoice',
        'customer_reference',
        'client_id',
        'region',
        'line_area_code',
        'line_description',
        'charge_period_start',
        'charge_period_end',
        'charge_financial_year',
        'header_attr_1',
        'header_attr_2',
        'header_attr_3',
        'header_attr_4',
        'header_attr_5',
        'header_attr_6',
        'header_attr_7',
        'header_attr_8',
        'header_attr_9',
        'header_attr_10',
        'line_attr_1',
        'line_attr_2',
        'line_attr_3',
        'line_attr_4',
        'line_attr_5',
        'line_attr_6',
        'line_attr_7',
        'line_attr_8',
        'line_attr_9',
        'line_attr_10',
        'line_attr_11',
        'line_attr_12',
        'line_attr_13',
        'line_attr_14',
        'line_attr_15',
        'regime_value_1',
        'regime_value_2',
        'regime_value_3',
        'regime_value_4',
        'regime_value_5',
        'regime_value_6',
        'regime_value_7',
        'regime_value_8',
        'regime_value_9',
        'regime_value_10',
        'regime_value_11',
        'regime_value_12',
        'regime_value_13',
        'regime_value_14',
        'regime_value_15',
        'regime_value_16',
        'regime_value_17',
        'regime_value_18',
        'regime_value_19',
        'regime_value_20',
        'charge_calculation'
      )
    })
}
