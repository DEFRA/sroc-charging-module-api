'use strict'

const Boom = require('@hapi/boom')
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

    let results
    try {
      results = await AuthorisedSystemModel.transaction(async trx => {
        const newRecords = await AuthorisedSystemModel.query().insertGraphAndFetch(
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
        return newRecords
      })
    } catch (error) {
      throw Boom.internal("There was an error when we tried to create the authorised system. We'll assume it was our fault not yours.")
    }

    return results[0]
  }
}

module.exports = AuthorisedSystemController
