'use strict'

const { CustomerFilesController } = require('../controllers')

const routes = [
  {
    method: 'GET',
    path: '/v2/{regimeId}/customer-files',
    handler: CustomerFilesController.index
  }
]

module.exports = routes
