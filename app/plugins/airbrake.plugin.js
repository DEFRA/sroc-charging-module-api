/*
  We use Airbrake to capture errors thrown within the service and send them to
  an instance of Errbit we maintain in Defra.

  https://hapi.dev/api/?v=20.0.0#-request-event

  Airbrake doesn't provide a specific Hapi plugin. We've avoided others as they
  are very out of date. So instead we roll our own plugin using the following
  as references

  https://github.com/DEFRA/node-hapi-airbrake/blob/master/lib/index.js
  https://github.com/DEFRA/charging-module-api/blob/master/app/plugins/airbrake.js
*/
const Airbrake = require('@airbrake/node')
const AirbrakeConfig = require('../../config/airbrake.config')

const airbrakeNotifier = new Airbrake.Notifier({
  host: AirbrakeConfig.host,
  projectId: AirbrakeConfig.projectId,
  projectKey: AirbrakeConfig.projectKey,
  environment: AirbrakeConfig.environment,
  performanceStats: false
})

const airbrake = {
  name: 'airbrake',
  register: (server, options) => {
    // When Hapi emits a request event with an error we capture the details and
    // use Airbrake to send a request to our Errbit instance
    server.events.on({ name: 'request', channels: 'error' }, (req, event, tags) => {
      const promise = airbrakeNotifier.notify({
        error: event.error,
        session: {
          route: req.route.path,
          method: req.method,
          url: req.url.href
        }
      })
      promise
        .then(notice => {
          if (!notice.id) {
            console.log('Airbrake notification failed', notice.error)
          }
        })
        .catch(error => {
          console.log('Airbrake notification failed', error)
        })
    })

    // To enable us to send notifications via Airbrake to Errbit manually we
    // register a method with the server
    //
    // https://hapi.dev/api/?v=20.0.0#-servermethods
    server.method('notify', (error, session) => {
      const promise = airbrakeNotifier.notify({
        error: error,
        session: session
      })
      promise
        .then(notice => {
          if (!notice.id) {
            console.log('Airbrake notification failed', notice.error)
          }
        })
        .catch(error => {
          console.log('Airbrake notification failed', error)
        })
    })
  }
}

module.exports = airbrake
