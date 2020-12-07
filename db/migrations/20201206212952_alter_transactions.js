'use strict'

const tableName = 'transactions'

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Rename a column
      table.renameColumn('charge_credit', 'credit')

      // Add new columns
      table.uuid('created_by').notNullable()
      table.uuid('regime_id').notNullable()
      table.string('ruleset').notNullable()
      table.string('region')
      table.string('customer_reference')
      table.date('period_start')
      table.date('period_end')
      table.integer('financial_year')
      table.boolean('new_licence')
      table.string('client_id')
      table.string('line_area_code')
      table.string('line_description')
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
      table.json('calculation')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Revert rename of column
      table.renameColumn('credit', 'charge_credit')

      // Drop the columns we added
      table.dropColumns(
        'created_by',
        'regime_id',
        'ruleset',
        'region',
        'customer_reference',
        'period_start',
        'period_end',
        'financial_year',
        'new_licence',
        'client_id',
        'line_area_code',
        'line_description',
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
        'calculation'
      )
    })
}
