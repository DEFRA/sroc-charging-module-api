'use strict'

const BillRunPlugin = {
  name: 'bill_run',
  register: (server, _options) => {
    server.ext('onPreHandler', (request, h) => {
      const billRunRegex = new RegExp(/\/bill-runs\//i)
      if (billRunRegex.test(request.path)) {
        console.log("It's a bill run")
      }

      return h.continue
    })
  }
}

module.exports = BillRunPlugin
