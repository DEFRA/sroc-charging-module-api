'use strict'

const tableName = 'transactions'

const columns = [
  { oldName: 'header_attr1', newName: 'header_attr_1' },
  { oldName: 'header_attr2', newName: 'header_attr_2' },
  { oldName: 'header_attr3', newName: 'header_attr_3' },
  { oldName: 'header_attr4', newName: 'header_attr_4' },
  { oldName: 'header_attr5', newName: 'header_attr_5' },
  { oldName: 'header_attr6', newName: 'header_attr_6' },
  { oldName: 'header_attr7', newName: 'header_attr_7' },
  { oldName: 'header_attr8', newName: 'header_attr_8' },
  { oldName: 'header_attr9', newName: 'header_attr_9' },
  { oldName: 'header_attr10', newName: 'header_attr_10' },
  { oldName: 'line_attr1', newName: 'line_attr_1' },
  { oldName: 'line_attr2', newName: 'line_attr_2' },
  { oldName: 'line_attr3', newName: 'line_attr_3' },
  { oldName: 'line_attr4', newName: 'line_attr_4' },
  { oldName: 'line_attr5', newName: 'line_attr_5' },
  { oldName: 'line_attr6', newName: 'line_attr_6' },
  { oldName: 'line_attr7', newName: 'line_attr_7' },
  { oldName: 'line_attr8', newName: 'line_attr_8' },
  { oldName: 'line_attr9', newName: 'line_attr_9' },
  { oldName: 'line_attr10', newName: 'line_attr_10' },
  { oldName: 'line_attr11', newName: 'line_attr_11' },
  { oldName: 'line_attr12', newName: 'line_attr_12' },
  { oldName: 'line_attr13', newName: 'line_attr_13' },
  { oldName: 'line_attr14', newName: 'line_attr_14' },
  { oldName: 'line_attr15', newName: 'line_attr_15' },
  { oldName: 'regime_value1', newName: 'regime_value_1' },
  { oldName: 'regime_value2', newName: 'regime_value_2' },
  { oldName: 'regime_value3', newName: 'regime_value_3' },
  { oldName: 'regime_value4', newName: 'regime_value_4' },
  { oldName: 'regime_value5', newName: 'regime_value_5' },
  { oldName: 'regime_value6', newName: 'regime_value_6' },
  { oldName: 'regime_value7', newName: 'regime_value_7' },
  { oldName: 'regime_value8', newName: 'regime_value_8' },
  { oldName: 'regime_value9', newName: 'regime_value_9' },
  { oldName: 'regime_value10', newName: 'regime_value_10' },
  { oldName: 'regime_value11', newName: 'regime_value_11' },
  { oldName: 'regime_value12', newName: 'regime_value_12' },
  { oldName: 'regime_value13', newName: 'regime_value_13' },
  { oldName: 'regime_value14', newName: 'regime_value_14' },
  { oldName: 'regime_value15', newName: 'regime_value_15' },
  { oldName: 'regime_value16', newName: 'regime_value_16' },
  { oldName: 'regime_value17', newName: 'regime_value_17' },
  { oldName: 'regime_value18', newName: 'regime_value_18' },
  { oldName: 'regime_value19', newName: 'regime_value_19' },
  { oldName: 'regime_value20', newName: 'regime_value_20' }
]

exports.up = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Iterate over columns list and rename from old name to new name
      columns.forEach(column => table.renameColumn(column.oldName, column.newName))
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .alterTable(tableName, table => {
      // Iterate over columns list and rename from new name back to new name
      columns.forEach(column => table.renameColumn(column.newName, column.oldName))
    })
}
