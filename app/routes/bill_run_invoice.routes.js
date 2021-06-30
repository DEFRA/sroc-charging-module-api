import BillRunsInvoicesController from '../controllers/presroc/bill_runs_invoices.controller.js'

const BillRunInvoiceRoutes = [
  {
    method: 'DELETE',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/invoices/{invoiceId}',
    handler: BillRunsInvoicesController.delete
  },
  {
    method: 'GET',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/invoices/{invoiceId}',
    handler: BillRunsInvoicesController.view
  },
  {
    method: 'PATCH',
    path: '/v2/{regimeId}/bill-runs/{billRunId}/invoices/{invoiceId}/rebill',
    handler: BillRunsInvoicesController.rebill
  }
]

export default BillRunInvoiceRoutes
