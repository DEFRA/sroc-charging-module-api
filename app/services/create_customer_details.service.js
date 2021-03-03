'use strict'

/**
 * @module CreateCustomerDetailsService
 */

const { CustomerModel } = require('../models')
const { CustomerTranslator } = require('../translators')

class CreateCustomerDetailsService {
  /**
   * Takes the provided payload and creates an entry in the customers table,  which will be periodically sent to SSCL to
   * update customer details.
   *
   * @param {module:RegimeModel} regime Instance of `RegimeModel` for the regime this customer is being amended for.
   * @param {object} payload Object containing the customer data to be saved.
   *
   * @returns {module:CustomerModel} Instance of `CustomerModel` representing the persisted data.
   */
  static async go (regime, payload) {
    const translator = this._translateRequest(payload, regime)

    const customer = await this._create(translator)

    return customer
  }

  static _translateRequest (payload, regime) {
    return new CustomerTranslator({
      ...payload,
      regimeId: regime.id
    })
  }

  static _create (translator) {
    return CustomerModel.query()
      .findOrInsert({ ...translator })
  }
}

module.exports = CreateCustomerDetailsService
