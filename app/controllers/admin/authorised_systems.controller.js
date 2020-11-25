'use strict'

const { ListAuthorisedSystemsService } = require('../../services')

class AuthorisedSystemsController {
  static async index (_req, h) {
    const result = await ListAuthorisedSystemsService.go()

    return h.response(result).code(200)
  }

  static async show (req, h) {
    return h.response('hello').code(200)
  }
}

module.exports = AuthorisedSystemsController
