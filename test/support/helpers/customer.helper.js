'use strict'

const { CustomerFileModel } = require('../../../app/models')
const GeneralHelper = require('./general.helper')

/**
 * Use to help with creating customer records, for example, 'CustomerFiles'
 */
class CustomerFileHelper {
  /**
   * Create a `customer_file` record
   *
   * @param {module:RegimeModel} [regime] Instance of `RegimeModel` to assign the customer file to. If null it will
   * generate a random UUID and use that instead
   * @param {string} [region] Region to use. Defaults to 'A'
   * @param {string} [fileReference] File reference to use. Defaults to 'nalac50001'
   * @param {string} [status] Status to use. Defaults to 'exported'. If set to `exported` it will also default
   * `exported_at` to `Date.now()`
   *
   * @returns {module:CustomerFileModel} The newly created instance of `CustomerFileModel`
   */
  static addCustomerFile (regime = null, region = 'A', fileReference = 'nalac50001', status = 'exported') {
    return CustomerFileModel.query()
      .insert({
        regimeId: this._regimeId(regime),
        region,
        fileReference,
        exportedAt: this._exportedAt(status)
      })
      .returning('*')
  }

  static _regimeId (regime) {
    return regime?.id ?? GeneralHelper.uuid4()
  }

  static _exportedAt (status) {
    if (status === 'exported') {
      return new Date().toISOString()
    }

    return null
  }
}

module.exports = CustomerFileHelper
