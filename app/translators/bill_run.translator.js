' use strict'

const BaseTranslator = require('./base.translator')
const Joi = require('joi')

class BillRunTranslator extends BaseTranslator {
  _translations () {
    return {
      regimeId: 'regimeId',
      region: 'region'
    }
  }

  _schema () {
    return Joi.object({
      regimeId: Joi.string().required(),
      region: Joi.string().uppercase().valid(...this._validRegions())
    })
  }

  _validRegions () {
    return ['A', 'B', 'E', 'N', 'S', 'T', 'W', 'Y']
  }
}

module.exports = BillRunTranslator
