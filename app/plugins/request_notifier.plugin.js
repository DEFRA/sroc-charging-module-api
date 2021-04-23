'use strict'

/**
 * Add an instance of `RequestNotifier` to the `request.app` as part of every request.
 *
 * This makes writing to the log and sending notifications to Errbit more accesible, easier to use, and more consistent
 * in the controllers and their underlying services.
 *
 * @module RequestNotifierPlugin
 */

const { RequestNotifier } = require('../lib')

const RequestNotifierPlugin = {
  name: 'Notifier',
  register: (server, _options) => {
    server.ext('onRequest', (request, h) => {
      request.app.notifier = new RequestNotifier(request.info.id, server.logger, server.methods.notify)

      return h.continue
    })
  }
}

module.exports = RequestNotifierPlugin
