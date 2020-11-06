'use strict'

const BaseTranslator = require('./base.translator')

class ChargeTranslator extends BaseTranslator {
  constructor (data) {
    super(data)

    // Getter for prorata days
    Object.defineProperty(this, 'lineAttr3', {
      get () {
        return this._prorataDays()
      },
      enumerable: true
    })

    // Getter for financial year based on chargePeriodStart
    Object.defineProperty(this, 'chargeFinancialYear', {
      get () {
        return this._financialYear(this.chargePeriodStart)
      },
      enumerable: true
    })

    // Getter for financial year based on chargePeriodEnd
    // Used only for validating that the dates are in the same financial year
    Object.defineProperty(this, 'chargePeriodEndFinancialYear', {
      get () {
        return this._financialYear(this.chargePeriodEnd)
      },
      enumerable: true
    })
  }

  _translations () {
    return {
      chargeCategoryCode: 'chargeCategoryCode',
      periodStart: 'chargePeriodStart',
      periodEnd: 'chargePeriodEnd',
      credit: 'chargeCredit',
      billableDays: 'regimeValue4',
      authorisedDays: 'regimeValue5',
      volume: 'lineAttr5',
      source: 'regimeValue6',
      section130Agreement: 'regimeValue9',
      section126Agreement: 'regimeValue10',
      section126Factor: 'regimeValue11',
      section127Agreement: 'regimeValue12',
      twoPartTariff: 'regimeValue16',
      compensationCharge: 'regimeValue17'
    }
  }

  _prorataDays () {
    return `${this._padNumber(this.regimeValue4)}/${this._padNumber(this.regimeValue5)}`
  }

  // If the charge period start date is January to March then the financial year is the previous year
  // Otherwise, the financial year is the current year
  _financialYear (date) {
    const chargePeriodDate = new Date(date)
    const month = chargePeriodDate.getMonth()
    const year = chargePeriodDate.getFullYear()

    return (month <= 2 ? year - 1 : year)
  }

  // Return a number as a string, padded to 3 digits with leading zeroes
  _padNumber (number) {
    return number.toString().padStart(3, '0')
  }
}

module.exports = ChargeTranslator
