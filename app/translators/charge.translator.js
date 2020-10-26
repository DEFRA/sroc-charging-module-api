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

    // Getter for financial year
    Object.defineProperty(this, 'chargeFinancialYear', {
      get () {
        return this._financialYear()
      },
      enumerable: true
    })
  }

  _translations () {
    return {
      periodStart: 'chargePeriodStart',
      periodEnd: 'chargePeriodEnd',
      credit: 'chargeCredit',
      billableDays: 'regimeValue4',
      authorisedDays: 'regimeValue5',
      volume: 'lineAttr5',
      source: 'regimeValue6',
      season: 'regimeValue7',
      loss: 'regimeValue8',
      section130Agreement: 'regimeValue9',
      section126Agreement: 'regimeValue10',
      section126Factor: 'regimeValue11',
      section127Agreement: 'regimeValue12',
      eiucSource: 'regimeValue13',
      waterUndertaker: 'regimeValue14',
      regionalChargingArea: 'regimeValue15',
      twoPartTariff: 'regimeValue16',
      compensationCharge: 'regimeValue17'
    }
  }

  _prorataDays () {
    return `${this._padNumber(this.regimeValue4)}/${this._padNumber(this.regimeValue5)}`
  }

  // If the charge period start date is January to March then the financial year is the previous year
  // Otherwise, the financial year is the current year
  _financialYear () {
    const chargePeriodStartDate = new Date(this.chargePeriodStart)
    const month = chargePeriodStartDate.getMonth()
    const year = chargePeriodStartDate.getFullYear()

    return (month < 3 ? year - 1 : year)
  }

  // Return a number as a string, padded to 3 digits with leading zeroes
  _padNumber (number) {
    return number.toString().padStart(3, '0')
  }
}

module.exports = ChargeTranslator
