' use strict'

const BaseTranslator = require('./base.translator')
const Joi = require('joi')

class BillRunTranslator extends BaseTranslator {
  _translations () {
    return {
      region: 'region'
    }
  }

  _schema () {
    return Joi.object({
      region: Joi.string().uppercase().valid(...this._validRegions())
    })
  }

  _validRegions () {
    return ['A', 'B', 'E', 'N', 'S', 'T', 'W', 'Y']
  }
}

module.exports = BillRunTranslator
