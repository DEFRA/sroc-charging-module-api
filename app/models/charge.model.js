'use strict'

const Boom = require('@hapi/boom')
const Joi = require('@hapi/joi')

class Charge {
  constructor (data) {
    const { error, value } = this.constructor.validate(data)
    if (error) {
      throw Boom.badData(error)
    }

    Object.assign(this, value)
  }

  static validate (data) {
    return Joi.validate(data, this.schema, { abortEarly: false })
  }

  static get schema () {
    return {
      chargeCategoryCode: Joi.string().trim().required(),
      chargePeriodStart: Joi.date().less(Joi.ref('chargePeriodEnd')).min('01-APR-2021').required(),
      chargePeriodEnd: Joi.date().greater(Joi.ref('chargePeriodStart')).max('31-MAR-2031').required(),
      chargeCredit: Joi.boolean().required(),
      regimeValue4: Joi.number().integer().min(0).max(366).required(),
      regimeValue5: Joi.number().integer().min(0).max(366).required(),
      lineAttr5: Joi.number().min(0),
      regimeValue6: Joi.string().trim().required(), // validated in rules service
      regimeValue7: Joi.string().trim(), // validated in rules service
      regimeValue8: Joi.string().trim(), // validated in rules service
      regimeValue9: Joi.boolean().required(),
      regimeValue10: Joi.boolean(),
      regimeValue11: Joi.number().allow(null).empty(null).default(1.0),
      regimeValue12: Joi.boolean().required(),
      regimeValue13: Joi.string().trim().when('regimeValue17', { is: Joi.valid(true), then: Joi.required() }), // validated in the rules service
      regimeValue14: Joi.boolean(),
      regimeValue15: Joi.string().trim(), // validated in the rules service
      regimeValue16: Joi.boolean().required(),
      regimeValue17: Joi.boolean().required(),
      lineAttr3: Joi.string().length(7).required(),
      chargeFinancialYear: Joi.number().required(),
      chargeValue: Joi.number().integer(),
      lineAttr9: Joi.string(),
      baselineCharge: Joi.number().integer(),
      lineAttr10: Joi.string()
    }
  }
}

module.exports = Charge
