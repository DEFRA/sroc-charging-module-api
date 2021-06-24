/**
 * @module MoveCustomersToExportedTableService
 */

const { CustomerModel, ExportedCustomerModel } = require('../models')

class MoveCustomersToExportedTableService {
  /**
   * Adds customers to the `exported_customers` table and deletes them from the `customers` table.
   *
   * @param {*} regime The regime of the customers to be moved.
   * @param {*} region The region of the customers to be moved.
   * @param {*} customerFileId The id of the file to be recorded against each customer in `exported_customers`.
   */
  static async go (regime, region, customerFileId) {
    await CustomerModel.transaction(async trx => {
      const customerQuery = this._selectCustomers(regime, region, trx)

      await this._populateExportedTable(customerQuery, customerFileId, trx)
      await this._clearCustomerTable(customerQuery)
    })
  }

  static _selectCustomers (regime, region, trx) {
    return CustomerModel.query(trx)
      .where('regimeId', regime.id)
      .where('region', region)
      .select('id', 'customerReference')
  }

  /**
   * Executes the query, iterates over the results and adds each customer to the `exported_customer` table
   */
  static async _populateExportedTable (customerQuery, customerFileId, trx) {
    const customers = await customerQuery
    for (const customer of customers) {
      const { customerReference } = customer
      await ExportedCustomerModel.query(trx)
        .insert({
          customerReference,
          customerFileId
        })
    }
  }

  static async _clearCustomerTable (customerQuery) {
    await customerQuery.delete()
  }
}

module.exports = MoveCustomersToExportedTableService
