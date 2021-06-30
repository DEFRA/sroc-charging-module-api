import BillRunsLicencesController from '../controllers/presroc/bill_runs_licences.controller.js'

const BillRunLicenceRoutes = [
  {
    method: 'DELETE',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/licences/{licenceId}',
    handler: BillRunsLicencesController.delete,
    options: {
      app: {
        excludeFromProd: true
      }
    }
  }
]

export default BillRunLicenceRoutes
