'use strict'

/**
 * @module CalculateChargeTranslator
 */

const BaseTranslator = require('./base.translator')
const Joi = require('joi').extend(require('@joi/date'))
const Boom = require('@hapi/boom')

class CalculateChargeTranslator extends BaseTranslator {
  constructor (data) {
    super(data)

    this.lineAttr3 = this._prorataDays()
    this.chargeFinancialYear = this._financialYear(this.chargePeriodStart)

    // Additional post-getter validation to ensure periodStart and periodEnd are in the same financial year
    this._validateFinancialYear()

    // Additional post-getter validation to ensure section126Factor has no more than 3 decimal places
    this._validateSection126Factor()

    // Additional post-getter parser to ensure that loss, season and source are all in the right 'case'
    this.regimeValue6 = this._titleCaseStringValue(this.regimeValue6)
    this.regimeValue7 = this._titleCaseStringValue(this.regimeValue7)
    this.regimeValue8 = this._titleCaseStringValue(this.regimeValue8)
  }

  _validateFinancialYear () {
    const schema = Joi.object({
      periodEndFinancialYear: Joi.number().equal(this.chargeFinancialYear)
    })

    const data = {
      periodEndFinancialYear: this._financialYear(this.chargePeriodEnd)
    }

    const { error } = schema.validate(data)

    if (error) {
      throw Boom.badData(error)
    }
  }

  /**
   * Validate `section126Factor` precision is no more than 3 decimal places
   *
   * When we export this value to the transaction file we generate for SOP, it must match an agreed format of no more
   * than 3 decimal places. This precision is enforced on us, and it's our responsibility to ensure the file is correct.
   *
   * We could have automatically rounded the the value sent by the client by using `Joi.number.precision()` in our
   * main schema for `section126Factor`. But then we would be responsible for amending a value used to generate a
   * charge to a customer.
   *
   * So, instead we believe it's important to reject the request and ask the client system to provide a value rounded to
   * 3 decimal places. The only way we can get `Joi.number.precision()` to error instead of round a value is to also
   * tell Joi not to convert values as part of the validation. This is why we need this custom validator, so we can
   * pass in `{ convert: false }` when the validation is performed.
   *
   * @throws {ValidationError}
   */
  _validateSection126Factor () {
    const schema = Joi.object({
      section126Factor: Joi.number().precision(3)
    })

    const data = {
      section126Factor: this.regimeValue11
    }

    const { error } = schema.validate(data, { convert: false })

    if (error) {
      throw Boom.badData(error)
    }
  }

  /**
   * Use to title case a string value
   *
   * Title case is where the first character of each word is a capital and the rest is lower case. Our testing of the
   * rules service has highlighted that it will only calculate the charge correctly if the values for the `loss`,
   * `season`, and `source` in the request are in title case. Anything else and it fails to match them to resulting in a
   * 0 charge.
   *
   * This works for single-word strings (`summer` to `Summer`) and multi-word strings (`all year` to `All Year`).
   *
   * @param {string} value String value to be converted to title case
   *
   * @returns {string} The string value converted to title case
   */
  _titleCaseStringValue (value) {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word[0].toUpperCase() + word.substring(1))
      .join(' ')
  }

  _schema () {
    const validDateFormats = ['DD-MMM-YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY', 'YYYY/MM/DD']

    return Joi.object({
      authorisedDays: Joi.number().integer().min(0).max(366).required(),
      billableDays: Joi.number().integer().min(0).max(366).required(),
      compensationCharge: Joi.boolean().required(),
      credit: Joi.boolean().required(),
      // validated in the rules service
      eiucSource: Joi.when('compensationCharge', { is: true, then: Joi.string().required() }),
      loss: Joi.string().required(), // validated in rules service
      periodStart: Joi.date().format(validDateFormats).max(Joi.ref('periodEnd')).min('01-APR-2014').required(),
      periodEnd: Joi.date().format(validDateFormats).required(),
      regionalChargingArea: Joi.string().required(), // validated in the rules service
      // Set a new field called ruleset. This will be used to determine which ruleset to query in the rules service. If
      // the data comes from a calculate charge request we deafult it. If the data comes from a create transaction
      // request it will already be populated
      ruleset: Joi.string().default('presroc'),
      season: Joi.string().required(), // validated in rules service
      section126Factor: Joi.number().allow(null).empty(null).default(1.0),
      section127Agreement: Joi.boolean().required(),
      section130Agreement: Joi.boolean().required(),
      source: Joi.string().required(), // validated in rules service
      twoPartTariff: Joi.boolean().required(),
      volume: Joi.number().min(0).required(),
      waterUndertaker: Joi.boolean().when('compensationCharge', { is: true, then: Joi.required() }),
      regime: Joi.string().required() // needed to determine which endpoints to call in the rules service
    })
  }

  _translations () {
    return {
      authorisedDays: 'regimeValue5',
      billableDays: 'regimeValue4',
      compensationCharge: 'regimeValue17',
      credit: 'chargeCredit',
      eiucSource: 'regimeValue13',
      loss: 'regimeValue8',
      periodEnd: 'chargePeriodEnd',
      periodStart: 'chargePeriodStart',
      regionalChargingArea: 'regimeValue15',
      ruleset: 'ruleset',
      season: 'regimeValue7',
      section126Factor: 'regimeValue11',
      section127Agreement: 'regimeValue12',
      section130Agreement: 'regimeValue9',
      source: 'regimeValue6',
      twoPartTariff: 'regimeValue16',
      volume: 'lineAttr5',
      waterUndertaker: 'regimeValue14',
      regime: 'regime'
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
   * The exception is if this is a two-part tariff (ie. regimeValue16 is true); in this case, it returns `000/000`.
   *
   * @returns {String} Billable days and authorised days as a formatted string
   */
  _prorataDays () {
    return this.regimeValue16
      ? '000/000'
      : `${this._padNumber(this.regimeValue4)}/${this._padNumber(this.regimeValue5)}`
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
