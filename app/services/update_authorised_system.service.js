'use strict'

/**
 * @module UpdateAuthorisedSystemService
 */

const Boom = require('@hapi/boom')

const { AuthorisedSystemModel } = require('../models')

class UpdateAuthorisedSystemService {
  static async go (id, payload) {
    const authorisedSystem = await this._authorisedSystem(id)

    if (!authorisedSystem) {
      throw Boom.notFound(`No authorised system found with id ${id}`)
    }
  }

  static _authorisedSystem (id) {
    return AuthorisedSystemModel.query()
      .findById(id)
      .withGraphFetched('regimes')
  }
}

module.exports = UpdateAuthorisedSystemService
