'use strict'

/**
 * @module TransactionFileBodyPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Formats data for the body of a transaction file.
 *
 * Note that data.index and data.transactionReference are added by StreamTransformUsingPresenter and are not part of the
 * data originally read from the source transaction record.
 *
 * With reference to the existing v1 charging module transaction file presenter:
 * https://github.com/DEFRA/charging-module-api/blob/main/app/schema/pre_sroc/wrls/transaction_file_presenter.js
 */

class TransactionFileBodyPresenter extends BasePresenter {
  _presentation (data) {
    return {
      col01: 'D',
      col02: this._leftPadZeroes(data.index, 7),
      col03: data.customerReference,
      col04: this._formatDate(Date.now()),
      col05: this._invoiceType(data.debitLineValue, data.creditLineValue),
      col06: data.transactionReference,
      col07: '',
      col08: 'GBP',
      col09: '',
      col10: this._formatDate(Date.now()),
      col11: '',
      col12: '',
      col13: '',
      col14: '',
      col15: '',
      col16: '',
      col17: '',
      col18: '',
      col19: '',
      col20: this._signedCreditValue(data.chargeValue, data.chargeCredit),
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
      col34: this._blankIfCompensationChargeOrMinimumCharge(this._cleanseNull(data.lineAttr9), data),
      col35: this._blankIfCompensationChargeOrMinimumCharge(this._cleanseNull(data.lineAttr10), data),
      col36: '',
      col37: '',
      col38: this._blankIfNotCompensationCharge(data.lineAttr13, data),
      col39: this._blankIfNotCompensationCharge(data.lineAttr14, data),
      col40: '',
      col41: '1',
      col42: 'Each',
      col43: this._signedCreditValue(data.chargeValue, data.chargeCredit)
    }
  }

  /**
   * Returns 'C' if the invoice is a credit and 'I' if the invoice is a debit
   */
  _invoiceType (debit, credit) {
    return debit - credit < 0 ? 'C' : 'I'
  }

  /**
   * Several fields rely on whether or not this transaction is a compensation charge. This is held in regimeValue17 as a
   * string so we add a helper function to return it as a boolean.
   */
  _compensationCharge (data) {
    // We don't expect to store anything other than lower case but we change case just to be safe. We use optional
    // chaining as regimeValue17 is null for minimum charge transactions.
    return data.regimeValue17?.toLowerCase() === 'true'
  }

  /**
   * Returns an empty string if this is a compensation charge
   * Also returns an empty string if this is a minimum charge adjustment
   */
  _blankIfCompensationChargeOrMinimumCharge (value, data) {
    return this._compensationCharge(data) || data.minimumChargeAdjustment ? '' : value
  }

  /**
   * Returns an empty string if this is not a compensation charge
   */
  _blankIfNotCompensationCharge (value, data) {
    return this._compensationCharge(data) ? value : ''
  }

  /**
   * Returns the provided value with ' Ml' appended.
   */
  _volumeInMegaLitres (value) {
    return `${value} Ml`
  }
}

module.exports = TransactionFileBodyPresenter
