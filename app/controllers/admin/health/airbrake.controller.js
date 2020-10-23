'use strict'

class AirbrakeController {
  static async index (req, _h) {
    req.server.methods.notify(
      new Error('Airbrake test error - manual'),
      { message: 'Use me to log other events' }
    )
    throw new Error('Airbrake test error - automatic')
  }
}

module.exports = AirbrakeController
