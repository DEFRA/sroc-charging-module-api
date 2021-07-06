/**
 * Determines if the request is related to an invoice and does the work of first finding it, then validating if the
 * request is valid, ie. that the invoice exists.
 *
 * This sits as a partner plugin with RequestBillRun, so that by the time we get to a controller we have already
 * retrieved and validated any bill run and invoice included in the url.
 *
 * In this case most of the work is done by the {@module RequestInvoiceService}. If invoice is found and valid for the
 * request the plugin adds the {@module InvoiceModel} instance to `request.app` as per the
 * {@link https://hapi.dev/api/?v=20.1.0#-requestapp|Hapi documentation} to make it available to all controllers.
 *
 * @module RequestInvoicePlugin
 */

import RequestInvoiceService from '../services/plugins/request_invoice.service.js'

const RequestInvoicePlugin = {
  name: 'request_invoice',
  register: (server, _options) => {
    server.ext('onPreHandler', async (request, h) => {
      const { invoiceId } = request.params
      request.app.invoice = await RequestInvoiceService.go(request.path, invoiceId)

      return h.continue
    })
  }
}

export default RequestInvoicePlugin
