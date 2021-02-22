'use strict'

const { RequestBillRunService } = require('../services')

const BillRunPlugin = {
  name: 'bill_run',
  register: (server, _options) => {
    server.ext('onPreHandler', async (request, h) => {
      const { billRunId } = request.params
      request.app.billRun = await RequestBillRunService.go(request.path, request.method, request.app.regime, billRunId)

      return h.continue
    })
  }
}

module.exports = BillRunPlugin
