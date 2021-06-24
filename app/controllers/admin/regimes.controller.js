const { ListRegimesService, ShowRegimeService } = require('../../services')

class RegimesController {
  static async index (_req, h) {
    const result = await ListRegimesService.go()

    return h.response(result).code(200)
  }

  static async show (req, h) {
    const result = await ShowRegimeService.go(req.params.id)

    return h.response(result).code(200)
  }
}

module.exports = RegimesController
