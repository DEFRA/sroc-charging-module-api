'use strict'

const BillRunsLicencesController = require('../controllers/bill_runs_licences.controller.js')

const routes = [
  {
    method: 'DELETE',
    path: '/v2/{regimeSlug}/bill-runs/{billRunId}/licences/{licenceId}',
    handler: BillRunsLicencesController.delete
  },
  {
    method: 'DELETE',
    path: '/v3/{regimeSlug}/bill-runs/{billRunId}/licences/{licenceId}',
    handler: BillRunsLicencesController.delete
  }
]

module.exports = routes
