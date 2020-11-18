'use strict'

const Boom = require('@hapi/boom')
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
    try {
      const result = await CreateAuthorisedSystemService.call(req.payload)
      return h.response(result).code(201)
    } catch (error) {
      // TODO: Think we can drop try/catch altogether and use a global hook to manage our errors and ensure they are
      // boomed!
      // https://medium.com/@andv/hapi-transforming-an-internal-server-error-occured-into-correct-boom-errors-1a2a72e6ffff
      if (Boom.isBoom(error)) {
        throw error
      } else {
        throw Boom.boomify(error)
      }
    }
  }
}

module.exports = AuthorisedSystemController
