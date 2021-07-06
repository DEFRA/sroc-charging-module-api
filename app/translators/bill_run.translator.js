import Joi from 'joi'

import BaseTranslator from './base.translator.js'

export default class BillRunTranslator extends BaseTranslator {
  _translations () {
    return {
      authorisedSystemId: 'createdBy',
      regimeId: 'regimeId',
      region: 'region',
      status: 'status'
    }
  }

  _schema () {
    return Joi.object({
      authorisedSystemId: Joi.string().required(),
      regimeId: Joi.string().required(),
      region: Joi.string().uppercase().valid(...this._validRegions()).required(),
      status: Joi.string().default('initialised')
    })
  }

  _validRegions () {
    return ['A', 'B', 'E', 'N', 'S', 'T', 'W', 'Y']
  }
}
