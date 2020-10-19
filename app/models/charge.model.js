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
      charge_period_start: Joi.date().less(Joi.ref('charge_period_end')).min('01-APR-2014').required(),
      charge_period_end: Joi.date().greater(Joi.ref('charge_period_start')).max('31-MAR-2021').required(),
      charge_credit: Joi.boolean().required(),
      regime_value_4: Joi.number().integer().min(0).max(366).required(),
      regime_value_5: Joi.number().integer().min(0).max(366).required(),
      line_attr_5: Joi.number().min(0).required(),
      regime_value_6: Joi.string().trim().required(), // validated in rules service
      regime_value_7: Joi.string().trim().required(), // validated in rules service
      regime_value_8: Joi.string().trim().required(), // validated in rules service
      regime_value_9: Joi.boolean().required(),
      regime_value_11: Joi.number().allow(null).empty(null).default(1.0),
      regime_value_12: Joi.boolean().required(),
      regime_value_16: Joi.boolean().required(),
      regime_value_17: Joi.boolean().required(),
      regime_value_13: Joi.string().trim().when('regime_value_17', { is: Joi.valid(true), then: Joi.required() }), // validated in the rules service
      regime_value_14: Joi.boolean().required(),
      regime_value_15: Joi.string().trim().required() // validated in the rules service
    }
  }
}

module.exports = Charge
