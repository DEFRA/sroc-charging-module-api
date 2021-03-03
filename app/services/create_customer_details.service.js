'use strict'

/**
 * @module CreateCustomerDetailsService
 */

const { CustomerModel } = require('../models')

class CreateCustomerDetailsService {
  /**
   * Takes the provided payload and creates an entry in the customers table,  which is periodically sent to SSCL to
   * update customer details.
   *
   * @param {module:RegimeModel} regime Instance of `RegimeModel` for the regime this customer is being amended for.
   * @param {object} payload Object containing the customer data to be saved.
   *
   * @returns {module:CustomerModel} Instance of `CustomerModel` representing the persisted data.
   */
  static async go (regime, payload) {
    return CustomerModel.query()
      .findOrInsert({
        ...payload,
        regimeId: regime.id
      })
  }
}

module.exports = CreateCustomerDetailsService
