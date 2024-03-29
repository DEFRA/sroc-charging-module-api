'use strict'

/**
 * @module CalculateChargeBaseTranslator
 */

const Boom = require('@hapi/boom')
const Joi = require('joi').extend(require('@joi/date'))

const BaseTranslator = require('./base.translator.js')

class CalculateChargeBaseTranslator extends BaseTranslator {
  _schema () {
    const rules = this._rules()

    return Joi.object(rules)
  }

  _baseRules () {
    return {
      authorisedDays: Joi.number().integer().min(0).max(366).required(),
      billableDays: Joi.number().integer().min(0).max(366).required(),
      compensationCharge: Joi.boolean().required(),
      credit: Joi.boolean().required(),
      section130Agreement: Joi.boolean().required(),

      // Dependent on `compensationCharge`
      twoPartTariff: Joi.boolean().required()
        .when('compensationCharge', { is: true, then: Joi.equal(false) }),

      // Dependent on `twoPartTariff`
      section127Agreement: Joi.boolean().required()
        .when('twoPartTariff', { is: true, then: Joi.equal(true) }),

      // Needed to determine which endpoints to call in the rules service
      regime: Joi.string().required(),

      // Case-insensitive validation matches and returns the correctly-capitalised string
      loss: this._validateStringAgainstList(this._validLosses()).required()
    }
  }

  _validDateFormats () {
    return ['DD-MMM-YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY', 'YYYY/MM/DD']
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
   * Perorming a case-insensitive validation against a provided list will match and return the correct capitalisation
   */
  _validateStringAgainstList (list) {
    return Joi.string().valid(...list).insensitive()
  }

  _validLosses () {
    throw new Error("Extending class must implement '_validLosses()'")
  }

  _validRegionalChargingAreas () {
    return [
      'Anglian',
      'Midlands',
      'Northumbria',
      'North West',
      'Southern',
      'South West (incl Wessex)',
      'Devon and Cornwall (South West)',
      'North and South Wessex',
      'Thames',
      'Yorkshire',
      'Dee',
      'Wye',
      'Wales'
    ]
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

module.exports = CalculateChargeBaseTranslator
