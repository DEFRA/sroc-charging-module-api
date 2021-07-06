import Joi from 'joi'

import BaseTranslator from './base.translator.js'

export default class AuthorisedSystemTranslator extends BaseTranslator {
  _translations () {
    return {
      clientId: 'clientId',
      name: 'name',
      admin: 'admin',
      status: 'status'
    }
  }

  _schema () {
    return Joi.object({
      clientId: Joi.string().required(),
      name: Joi.string().required(),
      admin: Joi.boolean().default(false),
      status: Joi.string().default('active'),
      authorisations: Joi.array().items(Joi.string())
    })
  }
}
