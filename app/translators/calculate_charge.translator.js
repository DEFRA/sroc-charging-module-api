'use strict'

/**
 * @module CalculateChargeTranslator
 */

const BaseTranslator = require('./base.translator')
const Joi = require('joi')
const Boom = require('@hapi/boom')

class CalculateChargeTranslator extends BaseTranslator {
  constructor (data) {
    super(data)

    this.lineAttr3 = this._prorataDays()
    this.chargeFinancialYear = this._financialYear(this.periodStart)

    // Additional post-getter validation to ensure periodStart and periodEnd are in the same financial year
    this._validateFinancialYear()
  }

  _validateFinancialYear () {
    const schema = Joi.object({
      periodEndFinancialYear: Joi.number().equal(this.chargeFinancialYear)
    })

    const data = {
      periodEndFinancialYear: this._financialYear(this.periodEnd)
    }

    const { error } = schema.validate(data)

    if (error) {
      throw Boom.badData(error)
    }
  }

  _schema () {
    return Joi.object({
      authorisedDays: Joi.number().integer().min(0).max(366).required(),
      billableDays: Joi.number().integer().min(0).max(366).required(),
      compensationCharge: Joi.boolean().required(),
      credit: Joi.boolean().required(),
      // validated in the rules service
      eiucSource: Joi.when('compensationCharge', { is: true, then: Joi.string().required() }),
      loss: Joi.string().required(), // validated in rules service
      periodStart: Joi.date().less(Joi.ref('periodEnd')).min('01-APR-2014').required(),
      periodEnd: Joi.date().required(),
      regionalChargingArea: Joi.string().required(), // validated in the rules service
      // Set a new field called ruleset. This will be used to determine which ruleset to query in the rules service
      ruleset: Joi.string().default('presroc'),
      season: Joi.string().required(), // validated in rules service
      section126Factor: Joi.number().allow(null).empty(null).default(1.0),
      section127Agreement: Joi.boolean().required(),
      section130Agreement: Joi.boolean().required(),
      source: Joi.string().required(), // validated in rules service
      twoPartTariff: Joi.boolean().required(),
      volume: Joi.number().min(0),
      waterUndertaker: Joi.boolean().required()
    })
  }

  _translations () {
    return {
      authorisedDays: 'regimeValue5',
      billableDays: 'regimeValue4',
      compensationCharge: 'regimeValue17',
      credit: 'chargeCredit',
      loss: 'regimeValue8',
      periodEnd: 'periodEnd',
      periodStart: 'periodStart',
      regionalChargingArea: 'regimeValue15',
      ruleset: 'ruleset',
      season: 'regimeValue7',
      section126Factor: 'regimeValue11',
      section127Agreement: 'regimeValue12',
      section130Agreement: 'regimeValue9',
      source: 'regimeValue6',
      twoPartTariff: 'regimeValue16',
      volume: 'lineAttr5',
      waterUndertaker: 'regimeValue14'
    }
  }

  /**
   * Returns the calculated financial year for a given date
   *
   * If the date is January to March then the financial year is the previous year. Otherwise, the financial year is the
   * current year.
   *
   * For example, if the date is 01-MAR-2022 then the financial year will be 2021. If the it's 01-MAY-2022 then the
   * financial year will be 2022.
   *
   * @param {String} date
   * @returns {Number} The calculated financial year
  */
  _financialYear (date) {
    const periodDate = new Date(date)
    const month = periodDate.getMonth()
    const year = periodDate.getFullYear()

    return (month <= 2 ? year - 1 : year)
  }

  /**
   * Returns billable and authorised day values as a specially formatted string.
   *
   * For example, if billable days is 12 and authorised days is 6 it will return `012/006`.
   *
   * @returns {String} Billable days and authorised days as a formatted string
   */
  _prorataDays () {
    return `${this._padNumber(this.regimeValue4)}/${this._padNumber(this.regimeValue5)}`
  }

  /**
   * Return a number as a string, padded to 3 digits with leading zeroes
   *
   * For example, `_padNumber(3)` will return `003`.
   *
   * @returns {Number} the number padded with leading zeroes
   */
  _padNumber (number) {
    return number.toString().padStart(3, '0')
  }
}

module.exports = CalculateChargeTranslator
