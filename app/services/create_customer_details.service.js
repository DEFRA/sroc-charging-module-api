/**
 * @module CreateCustomerDetailsService
 */

import CustomerModel from '../models/customer.model.js'
import CustomerTranslator from '../translators/customer.translator.js'

export default class CreateCustomerDetailsService {
  /**
   * Takes the provided payload and creates an entry in the customers table,  which will be periodically sent to SSCL to
   * update customer details.
   *
   * @param {object} payload Object containing the customer data to be saved.
   * @param {module:RegimeModel} regime Instance of `RegimeModel` for the regime this customer is being amended for.
   *
   * @returns {module:CustomerModel} Instance of `CustomerModel` representing the persisted data.
   */
  static async go (payload, regime) {
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
    // Implements UPSERT by specifying that the new data should be merged in case of a conflict
    return CustomerModel.query()
      .insert({ ...translator })
      .onConflict('customerReference')
      .merge()
  }
}
