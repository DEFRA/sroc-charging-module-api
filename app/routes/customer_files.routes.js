'use strict'

const Joi = require('joi')

const CustomerFilesController = require('../controllers/customer_files.controller')

const routes = [
  {
    method: 'GET',
    path: '/v2/{regimeSlug}/customer-files/{days?}',
    handler: CustomerFilesController.index,
    options: {
      validate: {
        params: {
          days: Joi.number().integer().min(0).default(30)
        },
        options: {
          // We only want to validate the days parameter and not regimeSlug. Setting allowUnknown to `true` means we
          // don't need to provide additional validation for regimeSlug.
          allowUnknown: true
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/v3/{regimeSlug}/customer-files/{days?}',
    handler: CustomerFilesController.index,
    options: {
      validate: {
        params: {
          days: Joi.number().integer().min(0).default(30)
        },
        options: {
          // We only want to validate the days parameter and not regimeSlug. Setting allowUnknown to `true` means we
          // don't need to provide additional validation for regimeSlug.
          allowUnknown: true
        }
      }
    }
  }
]

module.exports = routes
