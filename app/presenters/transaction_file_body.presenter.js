'use strict'

/**
 * @module TransactionFileBodyPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Formats data for saving to the body of a transaction file.
 *
 * TODO: col02 is not the bill run number but the SEQUENCE NUMBER
 *
 * With reference to the existing v1 charging module transaction file presenter:
 * https://github.com/DEFRA/charging-module-api/blob/main/app/schema/pre_sroc/wrls/transaction_file_presenter.js
 */

// TODO: STICK QUOTES AROUND TEXT FIELDS
class TransactionFileBodyPresenter extends BasePresenter {
  _presentation (data) {
    return {
      col01: 'D',
      col02: data.billRunNumber,
      col03: data.customerReference,
      col04: this._formatDate(data.transactionDate),
      col05: this._transactionType(data),
      col06: data.transactionReference,
      col07: '',
      col08: 'GBP',
      col09: '',
      col10: this._formatDate(data.headerAttr1),
      col11: '',
      col12: '',
      col13: '',
      col14: '',
      col15: '',
      col16: '',
      col17: '',
      col18: '',
      col19: '',
      col20: data.chargeValue,
      col21: '',
      col22: data.lineAreaCode,
      col23: data.lineDescription,
      col24: 'A',
      col25: '',
      col26: this._blankIfCompensationChargeOrMinimumCharge(data.lineAttr1, data),
      col27: this._blankIfCompensationChargeOrMinimumCharge(data.lineAttr2, data),
      col28: this._blankIfCompensationChargeOrMinimumCharge(data.lineAttr3, data),
      col29: this._blankIfCompensationChargeOrMinimumCharge(data.lineAttr4, data),
      col30: this._blankIfCompensationChargeOrMinimumCharge(this._volumeInMegaLitres(data.lineAttr5), data),
      col31: this._blankIfCompensationChargeOrMinimumCharge(data.lineAttr6, data),
      col32: this._blankIfCompensationChargeOrMinimumCharge(data.lineAttr7, data),
      col33: this._blankIfCompensationChargeOrMinimumCharge(data.lineAttr8, data),
      col34: this._blankIfCompensationChargeOrMinimumCharge(data.lineAttr9, data),
      col35: this._blankIfCompensationChargeOrMinimumCharge(data.lineAttr10, data),
      col36: '',
      col37: '',
      col38: this._blankIfNotCompensationCharge(data.lineAttr13, data),
      col39: this._blankIfNotCompensationCharge(data.lineAttr14, data),
      col40: '',
      col41: '1',
      col42: 'Each',
      col43: data.chargeValue
    }
  }

  // Returns a negative or positive value for chargeValue dependent on whether credit is true or false
  _transactionType (data) {
    return data.chargeCredit ? 'C' : 'I'
  }

  /**
   * Returns an empty string if this is a compensation charge, ie. if regimeValue17 is `true`
   * Also returns an empty string if this is a minimum charge adjustment
   */
  _blankIfCompensationChargeOrMinimumCharge (value, data) {
    return data.regimeValue17 || data.minimumChargeAdjustment ? '' : value
  }

  /**
   * Returns an empty string if this is not a compensation charge, ie. if regimeValue17 is `false`
   */
  _blankIfNotCompensationCharge (value, data) {
    return data.regimeValue17 ? value : ''
  }

  /**
   * Returns the provided value with ' Ml' appended.
   */
  _volumeInMegaLitres (value) {
    return `${value} Ml`
  }
}

module.exports = TransactionFileBodyPresenter
