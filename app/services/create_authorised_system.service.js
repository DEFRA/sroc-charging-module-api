'use strict'

/**
 * @module CreateAuthorisedSystemService
 */

const { AuthorisedSystemModel, RegimeModel } = require('../models')
const { AuthorisedSystemTranslator } = require('../translators')
const { JsonPresenter } = require('../presenters')

/**
 * Creates a new authorised system record
 *
 * The service handles validating and translating the request to the API and then creating a new authorised system. It
 * returns the new authorised system as the result.
 *
 * @param {Object} payload The payload from the API request
 *
 * @returns {Object} Details of the newly created authorised system
 */
class CreateAuthorisedSystemService {
  static async go (payload) {
    const translator = new AuthorisedSystemTranslator(payload)
    const regimes = await this._regimes(translator.authorisations)
    const authorisedSystem = await this._create(translator, regimes)

    return this._response(authorisedSystem)
  }

  static async _regimes (authorisations) {
    const regimes = await RegimeModel.query()
      .select('id')
      .where('slug', 'in', authorisations)

    return regimes
  }

  static async _create (translator, regimes) {
    return AuthorisedSystemModel.transaction(async trx => {
      const newRecords = await AuthorisedSystemModel.query(trx).insertGraphAndFetch(
        [
          {
            client_id: translator.clientId,
            name: translator.name,
            admin: false,
            status: translator.status,
            regimes: regimes
          }
        ],
        {
          relate: true
        }
      )
      return newRecords[0]
    })
  }

  static _response (authorisedSystem) {
    const presenter = new JsonPresenter(authorisedSystem)

    return presenter.go()
  }
}

module.exports = CreateAuthorisedSystemService
