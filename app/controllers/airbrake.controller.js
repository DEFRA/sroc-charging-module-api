class AirbrakeController {
  static async auto (_req, _h) {
    throw new Error('Airbrake test error - automatic')
  }

  static async manual (req, _h) {
    req.server.methods.notify(
      new Error('Airbrake test error - manual'),
      { message: 'Use me to log other events' }
    )
    return 'Manual notification sent using Airbrake to Errbit'
  }
}

module.exports = AirbrakeController
