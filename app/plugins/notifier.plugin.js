'use strict'

/**
 * @module NotifierPlugin
 */

const { Notifier } = require('../lib')

const NotifierPlugin = {
  name: 'Notifier',
  register: (server, _options) => {
    server.ext('onRequest', (request, h) => {
      request.app.notifier = new Notifier(server.logger, server.methods.notify)

      return h.continue
    })
  }
}

module.exports = NotifierPlugin
