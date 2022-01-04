'use strict'

/**
 * @module CalculateChargeBaseTranslator
 */

const BaseTranslator = require('./base.translator')
const Joi = require('joi').extend(require('@joi/date'))
const Boom = require('@hapi/boom')

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
      periodEnd: Joi.date().format(this._validDateFormats()).required(),
      section130Agreement: Joi.boolean().required(),

      // Dependent on `compensationCharge`
      waterUndertaker: Joi.boolean()
        .when('compensationCharge', { is: true, then: Joi.required() }),
      twoPartTariff: Joi.boolean().required()
        .when('compensationCharge', { is: true, then: Joi.equal(false) }),

      // Dependent on `twoPartTariff`
      section127Agreement: Joi.boolean().required()
        .when('twoPartTariff', { is: true, then: Joi.equal(true) }),

      // Needed to determine which endpoints to call in the rules service
      regime: Joi.string().required()
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
}

module.exports = CalculateChargeBaseTranslator
