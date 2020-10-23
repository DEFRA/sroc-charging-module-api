'use strict'

const PresrocBilRunsController = require('../controllers/presroc/bill_runs.controller')

const routes = [
  {
    method: 'GET',
    path: '/v1/{regimeId}/billruns',
    handler: PresrocBilRunsController.index
  },
  {
    method: 'GET',
    path: '/v2/{regimeId}/billruns',
    handler: PresrocBilRunsController.index
  }
]

module.exports = routes
