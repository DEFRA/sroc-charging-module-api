export default class AirbrakeController {
  static async index (req, _h) {
    // First section tests connecting to Airbrake through a manual notification
    req.server.app.airbrake.notify({
      message: 'Airbrake manual health check',
      error: new Error('Airbrake manual health check error'),
      session: {
        req: {
          id: req.info.id
        }
      }
    })

    // Second section throws an error and checks that we automatically capture it and then connect to Airbrake
    throw new Error('Airbrake automatic health check error')
  }
}
