'use strict'

const { AuthorisedSystemModel, RegimeModel } = require('../../models')

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

  static async create (req, _h) {
    const payload = req.payload

    const regimes = await RegimeModel.query()
      .select('id')
      .where('slug', 'in', payload.authorisations)

    const newSystem = await AuthorisedSystemModel.query()
      .insert({
        client_id: payload.clientId,
        name: payload.name,
        admin: false,
        status: payload.status
      })
      .returning('*')

    await newSystem.$relatedQuery('regimes').relate(regimes)

    return newSystem
  }
}

module.exports = AuthorisedSystemController
