'use strict'

/**
 * Add an instance of `Notifier` to the `request.app` as part of every request.
 *
 * This makes writing to the log and sending notifications to Errbit more accesible, easier to use, and more consistent
 * in the controllers and their underlying services.
 *
 * @module NotifierPlugin
 */

const { Notifier } = require('../lib')

const NotifierPlugin = {
  name: 'Notifier',
  register: (server, _options) => {
    server.ext('onRequest', (request, h) => {
      request.app.notifier = new Notifier(request.info.id, server.logger, server.methods.notify)

      return h.continue
    })
  }
}

module.exports = NotifierPlugin
