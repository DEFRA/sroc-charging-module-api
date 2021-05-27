'use strict'

const { PresrocBillRunsLicencesController } = require('../controllers')

const routes = [
  {
    method: 'DELETE',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/licences/{licenceId}',
    handler: PresrocBillRunsLicencesController.delete,
    options: {
      app: {
        excludeFromProd: true
      }
    }
  }
]

module.exports = routes
