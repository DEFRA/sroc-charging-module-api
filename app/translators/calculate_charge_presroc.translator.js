'use strict'

/**
 * @module CalculateChargePresrocTranslator
 */

const CalculateChargeBaseTranslator = require('./calculate_charge_base.translator')
const Joi = require('joi').extend(require('@joi/date'))
const Boom = require('@hapi/boom')

class CalculateChargePresrocTranslator extends CalculateChargeBaseTranslator {
  constructor (data) {
    super(data)

    this.lineAttr3 = this._prorataDays()
    this.chargeFinancialYear = this._financialYear(this.chargePeriodStart)

    // Additional post-getter validation to ensure periodStart and periodEnd are in the same financial year
    this._validateFinancialYear()

    // Additional post-getter validation to ensure section126Factor has no more than 3 decimal places
    this._validateSection126Factor()

    // Additional post-getter parser to ensure that season is in the right 'case'
    this.regimeValue7 = this._titleCaseStringValue(this.regimeValue7)
  }

  _rules () {
    return {
      ...this._baseRules(),
      ruleset: Joi.string().valid('presroc').required(),

      periodStart: Joi.date().format(this._validDateFormats()).max(Joi.ref('periodEnd')).min('01-APR-2014').required(),
      section126Factor: Joi.number().allow(null).empty(null).default(1.0),
      twoPartTariff: Joi.boolean().required(),
      volume: Joi.number().min(0).required(),

      // Dependent on `compensationCharge` and validated in the rules service
      eiucSource: Joi
        .when('compensationCharge', { is: true, then: Joi.string().required() }),

      // validated in the rules service
      regionalChargingArea: Joi.string().required(),
      season: Joi.string().required(),

      // Case-insensitive validation matches and returns the correctly-capitalised string
      source: Joi.string().valid(...this._validSources()).insensitive().required()
    }
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

  _validLosses () {
    return ['Very Low', 'Low', 'Medium', 'High']
  }

  _validSources () {
    return ['Supported', 'Kielder', 'Unsupported', 'Tidal']
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
   * rules service has highlighted that it will only calculate the charge correctly if the value for `season` in the
   * request is in title case. Anything else and it fails to match them to resulting in a 0 charge.
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

module.exports = CalculateChargePresrocTranslator
