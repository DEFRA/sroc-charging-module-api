'use strict'

const { CustomerFileModel } = require('../../../app/models')
const { ExportedCustomerModel } = require('../../../app/models')
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
   * @param {string} [status] Status to use. Defaults to 'exported'. If set to `exported` it will set `exported_at` to
   * the `exportedAt` parameter.
   * @param {date} [exportedAt] Date to use for `exported_at`. Defaults to the current date.
   *
   * @returns {module:CustomerFileModel} The newly created instance of `CustomerFileModel`
   */
  static addCustomerFile (regime = null, region = 'A', fileReference = 'nalac50001', status = 'exported', exportedAt = new Date()) {
    return CustomerFileModel.query()
      .insert({
        regimeId: this._regimeId(regime),
        region,
        fileReference,
        status,
        exportedAt: this._exportedAt(status, exportedAt)
      })
      .returning('*')
  }

  /**
   * Create a `exported_customer` record
   *
   * @param {module:CustomerFileModel} [customerFile] Instance of `CustomerFileModel` to assign the exported customer
   * to. If null it will generate a random UUID and use that instead
   * @param {string} [customerReference] customer reference to use. Defaults to 'AA02BEEB'
   *
   * @returns {module:ExportedCustomerModel} The newly created instance of `ExportedCustomerModel`
   */
  static addExportedCustomer (customerFile = null, customerReference = 'AA02BEEB') {
    return ExportedCustomerModel.query()
      .insert({
        customerFileId: this._customerFileId(customerFile),
        customerReference
      })
      .returning('*')
  }

  static _regimeId (regime) {
    return regime?.id ?? GeneralHelper.uuid4()
  }

  static _exportedAt (status, exportDate) {
    return status === 'exported' ? exportDate.toISOString() : null
  }

  static _customerFileId (customerFile) {
    return customerFile?.id ?? GeneralHelper.uuid4()
  }
}

module.exports = CustomerFileHelper
