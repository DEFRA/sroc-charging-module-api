'use strict'

const presroc = require('../controllers/presroc/transactions.controller')
const sroc = require('../controllers/sroc/transactions.controller')

const routes = [
  {
    method: 'GET',
    path: '/v1/transactions',
    handler: presroc.index
  },
  {
    method: 'GET',
    path: '/v2/transactions',
    handler: sroc.index
  }
]

module.exports = routes
