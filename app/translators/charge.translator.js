'use strict'

const BaseTranslator = require('./base.translator')
const Joi = require('joi')
const Boom = require('@hapi/boom')
const { RulesServiceConfig } = require('../../config')

class ChargeTranslator extends BaseTranslator {
  constructor (data) {
    super(data)

    // Prorata days string is generated from other properties
    this.lineAttr3 = this._prorataDays()

    // Financial year is calculated based on chargePeriodStart
    this.chargeFinancialYear = this._financialYear(this.chargePeriodStart)

    // Additional post-getter validation to ensure periodStart and periodEnd are in the same financial year
    this._validateFinancialYear()
  }

  _validateFinancialYear () {
    const schema = Joi.object({
      chargePeriodEndFinancialYear: Joi.number().equal(this.chargeFinancialYear)
    })

    const data = {
      chargePeriodEndFinancialYear: this._financialYear(this.chargePeriodEnd)
    }

    const { error } = schema.validate(data)

    if (error) {
      throw Boom.badData(error)
    }
  }

  _schema () {
    return Joi.object({
      chargeCategoryCode: Joi.string().required(),
      periodStart: Joi.date().less(Joi.ref('periodEnd')).min(RulesServiceConfig.srocMinDate).required(),
      periodEnd: Joi.date().required(),
      credit: Joi.boolean().required(),
      billableDays: Joi.number().integer().min(0).max(366).required(),
      authorisedDays: Joi.number().integer().min(0).max(366).required(),
      volume: Joi.number().min(0),
      source: Joi.string().required(), // validated in rules service
      section130Agreement: Joi.boolean().required(),
      section126Agreement: Joi.boolean(),
      section126Factor: Joi.number().allow(null).empty(null).default(1.0),
      section127Agreement: Joi.boolean().required(),
      twoPartTariff: Joi.boolean().required(),
      compensationCharge: Joi.boolean().required()
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
