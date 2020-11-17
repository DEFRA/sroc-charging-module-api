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

    // Perform creating the authorised system record and regime join records in
    // one go with insertGraph()
    // https://vincit.github.io/objection.js/guide/query-examples.html#graph-inserts
    const results = await AuthorisedSystemModel.query().insertGraphAndFetch(
      [
        {
          client_id: payload.clientId,
          name: payload.name,
          admin: false,
          status: payload.status,
          regimes: regimes
        }
      ],
      {
        relate: true
      }
    )

    return results[0]
  }
}

module.exports = AuthorisedSystemController
