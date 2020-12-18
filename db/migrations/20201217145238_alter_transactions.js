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
      table.string('header_attr1')
      table.string('header_attr2')
      table.string('header_attr3')
      table.string('header_attr4')
      table.string('header_attr5')
      table.string('header_attr6')
      table.string('header_attr7')
      table.string('header_attr8')
      table.string('header_attr9')
      table.string('header_attr10')
      table.string('line_attr1')
      table.string('line_attr2')
      table.string('line_attr3')
      table.string('line_attr4')
      table.string('line_attr5')
      table.string('line_attr6')
      table.string('line_attr7')
      table.string('line_attr8')
      table.string('line_attr9')
      table.string('line_attr10')
      table.string('line_attr11')
      table.string('line_attr12')
      table.string('line_attr13')
      table.string('line_attr14')
      table.string('line_attr15')
      table.string('regime_value1')
      table.string('regime_value2')
      table.string('regime_value3')
      table.string('regime_value4')
      table.string('regime_value5')
      table.string('regime_value6')
      table.string('regime_value7')
      table.string('regime_value8')
      table.string('regime_value9')
      table.string('regime_value10')
      table.string('regime_value11')
      table.string('regime_value12')
      table.string('regime_value13')
      table.string('regime_value14')
      table.string('regime_value15')
      table.string('regime_value16')
      table.string('regime_value17')
      table.string('regime_value18')
      table.string('regime_value19')
      table.string('regime_value20')
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
        'header_attr1',
        'header_attr2',
        'header_attr3',
        'header_attr4',
        'header_attr5',
        'header_attr6',
        'header_attr7',
        'header_attr8',
        'header_attr9',
        'header_attr10',
        'line_attr1',
        'line_attr2',
        'line_attr3',
        'line_attr4',
        'line_attr5',
        'line_attr6',
        'line_attr7',
        'line_attr8',
        'line_attr9',
        'line_attr10',
        'line_attr11',
        'line_attr12',
        'line_attr13',
        'line_attr14',
        'line_attr15',
        'regime_value1',
        'regime_value2',
        'regime_value3',
        'regime_value4',
        'regime_value5',
        'regime_value6',
        'regime_value7',
        'regime_value8',
        'regime_value9',
        'regime_value10',
        'regime_value11',
        'regime_value12',
        'regime_value13',
        'regime_value14',
        'regime_value15',
        'regime_value16',
        'regime_value17',
        'regime_value18',
        'regime_value19',
        'regime_value20',
        'charge_calculation'
      )
    })
}
