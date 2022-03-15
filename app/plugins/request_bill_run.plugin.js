'use strict'

/**
 * @module RequestBillRunPlugin
 */

/**
 * Determines if the request is related to a bill run (creating a new bill run being the exception) and does the work
 * of first finding it, then validating if the request is valid
 *
 * As the service developed we found more and more places where
 *
 * - we needed to find a bill run
 * - we needed to perform some initial validation on the request related to the bill run
 *
 * This led to duplication across the services, and in some places repeating both the find and validation process. When
 * this is the case we move the duplicated logic to a plugin so that the request lifecycle can handle what's required
 * once, before the controllers even get called.
 *
 * In this case most of the work is done by the {@module RequestBillRunService}. If bill run is found and valid for the
 * request the plugin adds the {@module BillRunModel} instance to `request.app` as per the
 * {@link https://hapi.dev/api/?v=20.1.0#-requestapp|Hapi documentation} to make it available to all controllers.
 */

const RequestBillRunService = require('../services/plugins/request_bill_run.service.js')

const RequestBillRunPlugin = {
  name: 'request_bill_run',
  register: (server, _options) => {
    server.ext('onPreHandler', async (request, h) => {
      const { billRunId } = request.params
      request.app.billRun = await RequestBillRunService.go(request.path, request.method, request.app.regime, billRunId)

      return h.continue
    })
  }
}

module.exports = RequestBillRunPlugin
