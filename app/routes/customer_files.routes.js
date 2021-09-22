'use strict'

const { CustomerFilesController } = require('../controllers')
const Joi = require('joi')

const routes = [
  {
    method: 'GET',
    path: '/v2/{regimeId}/customer-files/{days?}',
    handler: CustomerFilesController.index,
    options: {
      validate: {
        params: {
          days: Joi.number().integer().min(0).default(30)
        },
        options: {
          // We only want to validate the days parameter and not regimeId. Setting allowUnknown to `true` means we don't
          // need to provide additional validation for regimeId.
          allowUnknown: true
        }
      }
    }
  }
]

module.exports = routes
