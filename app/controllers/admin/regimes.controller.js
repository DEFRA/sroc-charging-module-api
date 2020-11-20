'use strict'

const { RegimeModel } = require('../../models')
const { ListRegimesService } = require('../../services')

class RegimesController {
  static async index (_req, h) {
    const result = await ListRegimesService.go()

    return h.response(result).code(200)
  }

  static async show (req, _h) {
    return RegimeModel
      .query()
      .findById(req.params.id)
  }
}

module.exports = RegimesController
