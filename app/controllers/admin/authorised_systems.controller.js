'use strict'

const { AuthorisedSystemModel } = require('../../models')
const { CreateAuthorisedSystemService } = require('../../services')

class AuthorisedSystemController {
  static async index (_req, _h) {
    return AuthorisedSystemModel
      .query()
  }

  static async show (req, _h) {
    return AuthorisedSystemModel
      .query()
      .findById(req.params.id)
      .withGraphFetched('regimes')
  }

  static async create (req, h) {
    const result = await CreateAuthorisedSystemService.call(req.payload)
    return h.response(result).code(201)
  }
}

module.exports = AuthorisedSystemController
