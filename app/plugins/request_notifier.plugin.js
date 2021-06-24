/**
 * Add an instance of `RequestNotifierLib` to the `request.app` as part of every request.
 *
 * This makes writing to the log and sending notifications to Errbit more accesible, easier to use, and more consistent
 * in the controllers and their underlying services.
 *
 * @module RequestNotifierPlugin
 */

const { RequestNotifierLib } = require('../lib')

const RequestNotifierPlugin = {
  name: 'Notifier',
  register: (server, _options) => {
    server.ext('onRequest', (request, h) => {
      request.app.notifier = new RequestNotifierLib(request.info.id, server.logger, server.app.airbrake)

      return h.continue
    })
  }
}

module.exports = RequestNotifierPlugin
