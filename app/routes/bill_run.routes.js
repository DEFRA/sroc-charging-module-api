'use strict'

const presroc = require('../controllers/presroc/bill_runs.controller')

const routes = [
  {
    method: 'GET',
    path: '/v1/{regimeId}/billruns',
    handler: presroc.index
  },
  {
    method: 'GET',
    path: '/v2/{regimeId}/billruns',
    handler: presroc.index
  }
]

module.exports = routes
