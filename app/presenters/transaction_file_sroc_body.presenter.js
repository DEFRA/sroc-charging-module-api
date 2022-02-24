'use strict'

/**
 * @module TransactionFileSrocBodyPresenter
 */

const BasePresenter = require('./base.presenter')

/**
 * Formats data for the body of an sroc transaction file.
 *
 * Note that data.index and data.transactionReference are added by StreamTransformUsingPresenter and are not part of the
 * data originally read from the source transaction record.
 */

class TransactionFileSrocBodyPresenter extends BasePresenter {
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
      col24: 'AT',
      col25: '',
      col26: this._blankIfCompensationCharge(data.lineAttr1, data),
      col27: '',
      col28: this._blankIfCompensationCharge(data.lineAttr2, data), // chargePeriod
      col29: this._blankIfCompensationCharge(data.lineAttr3, data), // prorata days
      col30: this._blankIfCompensationCharge(data.headerAttr4, data), // chargeCategoryCode
      col31: this._blankIfCompensationCharge(data.regimeValue18, data), // chargeCategoryDescription
      col32: this._blankIfCompensationCharge(data.headerAttr9, data), // baseCharge [in pence]
      col33: this._blankIfCompensationCharge(this._reductionsList(data), data),
      col34: this._blankIfCompensationCharge(this._supportedSource(data), data),
      col35: this._blankIfCompensationCharge(this._volume(data), data),
      col36: this._blankIfCompensationCharge(this._waterCompany(data), data),
      col37: this._blankIfNotCompensationCharge(this._compensationChargeAndRegion(data), data),
      col38: '',
      col39: '',
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
   */
  _blankIfCompensationCharge (value, data) {
    return this._compensationCharge(data) ? '' : value
  }

  /**
   * Returns an empty string if this is not a compensation charge
   */
  _blankIfNotCompensationCharge (value, data) {
    return this._compensationCharge(data) ? value : ''
  }

  /**
   * Returns a string containing a list of reductions, separated with commas
   */
  _reductionsList (data) {
    const reductions = []

    if (data.headerAttr2 !== '1') { // aggregateProportion
      reductions.push('Aggregate')
    }

    if (this._isTrue(data.headerAttr8)) { // winterOnly
      reductions.push('Winter Only Discount')
    }

    if (this._isTrue(data.regimeValue9)) { // section130Agreement
      reductions.push('CRT Discount')
    }

    if (data.regimeValue11 !== '1') { // abatementFactor
      reductions.push('Abatement of Charges')
    }

    if (this._isTrue(data.regimeValue12)) { // section127Agreement
      reductions.push('Two-Part Tariff')
    }

    if (data.regimeValue19 !== '1') { // adjustmentFactor
      reductions.push('Other')
    }

    return reductions.join(', ')
  }

  /**
   * Returns `supportedSourceValue, supportedSourceName` if supportedSource is true or blank string if false
   */
  _supportedSource (data) {
    return this._isTrue(data.headerAttr5) ? `${data.lineAttr11}, ${data.headerAttr6}` : ''
  }

  /**
   * Returns `actualVolume / authorisedVolume Ml` if twoPartTariff is true or blank string if false
   */
  _volume (data) {
    return this._isTrue(data.regimeValue16) ? `${data.regimeValue20} / ${data.headerAttr3} Ml` : ''
  }

  /**
   * Returns `waterCompanyChargeValue` if waterCompanyCharge is true or blank string if false
   */
  _waterCompany (data) {
    return this._isTrue(data.headerAttr7) ? data.headerAttr10 : ''
  }

  /**
   * Returns `compensationChargePercent% (regionalChargingArea)`
   */
  _compensationChargeAndRegion (data) {
    return `${data.regimeValue2}% (${data.regimeValue15})`
  }

  /**
   * Convenience method to determine if a boolean stored as a string is true
   */
  _isTrue (field) {
    // We don't expect to store anything other than lower case but we change case just to be safe. We use optional
    // chaining to avoid issues if field is `null`
    return field?.toLowerCase() === 'true'
  }
}

module.exports = TransactionFileSrocBodyPresenter
