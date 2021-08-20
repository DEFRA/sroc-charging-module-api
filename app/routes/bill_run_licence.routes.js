'use strict'

const { BillRunsLicencesController } = require('../controllers')

const routes = [
  {
    method: 'DELETE',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/licences/{licenceId}',
    handler: BillRunsLicencesController.delete
  }
]

module.exports = routes
