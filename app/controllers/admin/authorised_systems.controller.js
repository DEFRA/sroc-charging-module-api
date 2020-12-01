'use strict'

const { ListAuthorisedSystemsService, ShowAuthorisedSystemService } = require('../../services')

class AuthorisedSystemsController {
  static async index (_req, h) {
    const result = await ListAuthorisedSystemsService.go()

    return h.response(result).code(200)
  }

  static async show (req, h) {
    const result = await ShowAuthorisedSystemService.go(req.params.id)

    return h.response(result).code(200)
  }
}

module.exports = AuthorisedSystemsController
