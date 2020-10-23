'use strict'

const { PresrocBillRunsController } = require('../controllers')

const routes = [
  {
    method: 'GET',
    path: '/v1/{regimeId}/billruns',
    handler: PresrocBillRunsController.index
  },
  {
    method: 'GET',
    path: '/v2/{regimeId}/billruns',
    handler: PresrocBillRunsController.index
  }
]

module.exports = routes
