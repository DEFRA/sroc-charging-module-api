'use strict'

const { PresrocBillRunsController } = require('../controllers')

const routes = [
  {
    method: 'POST',
    path: '/v1/{regimeId}/billruns',
    handler: PresrocBillRunsController.create
  },
  {
    method: 'POST',
    path: '/v2/{regimeId}/billruns',
    handler: PresrocBillRunsController.create
  }
]

module.exports = routes
