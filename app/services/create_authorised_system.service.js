'use strict'

const { AuthorisedSystemModel, RegimeModel } = require('../models')
const { AuthorisedSystemTranslator } = require('../translators')
const { JsonPresenter } = require('../presenters')

class CreateAuthorisedSystemService {
  static async call (payload) {
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
    const results = await AuthorisedSystemModel.transaction(async trx => {
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
      return newRecords
    })

    return results
  }

  static _response (authorisedSystem) {
    const presenter = new JsonPresenter(authorisedSystem)

    return presenter.go()
  }
}

module.exports = CreateAuthorisedSystemService
