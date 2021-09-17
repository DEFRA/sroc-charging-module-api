'use strict'

const { ListRegimesService, ViewRegimeService } = require('../../services')

class RegimesController {
  static async index (_req, h) {
    const result = await ListRegimesService.go()

    return h.response(result).code(200)
  }

  static async view (req, h) {
    const result = await ViewRegimeService.go(req.params.id)

    return h.response(result).code(200)
  }
}

module.exports = RegimesController
