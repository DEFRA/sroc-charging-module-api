'use strict'

/**
 * @module CustomerFileBodyPresenter
 */

const BasePresenter = require('./base.presenter.js')

/**
 * Formats data for the body of a customer file.
 *
 * Note that data.index is added by StreamTransformUsingPresenter and is not part of the data originally read from the
 * source customer record.
 *
 * With reference to the existing v1 charging module customer file presenter:
 * https://github.com/DEFRA/charging-module-api/blob/main/app/schema/pre_sroc/wrls/customer_file_presenter.js
 */

class CustomerFileBodyPresenter extends BasePresenter {
  _presentation (data) {
    return {
      col01: 'D',
      col02: this._leftPadZeroes(data.index, 7),
      col03: data.customerReference,
      col04: data.customerName,
      col05: data.addressLine1,
      col06: this._cleanseNull(data.addressLine2),
      col07: this._cleanseNull(data.addressLine3),
      col08: this._cleanseNull(data.addressLine4),
      col09: this._cleanseNull(data.addressLine5),
      col10: this._cleanseNull(data.addressLine6),
      col11: data.postcode
    }
  }
}

module.exports = CustomerFileBodyPresenter
