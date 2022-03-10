'use strict'

/**
 * @module ListRegimesService
 */

const RegimeModel = require('../../models/regime.model')

const JsonPresenter = require('../../presenters/json.presenter')

/**
 * Returns an array of regimes
 *
 * @returns {module:RegimeModel[]} an array of `RegimeModel` based on regimes currently in the database
 */
class ListRegimesService {
  static async go () {
    const regimes = await this._regimes()

    return this._response(regimes)
  }

  static _regimes () {
    return RegimeModel
      .query()
  }

  static _response (regimes) {
    const presenter = new JsonPresenter(regimes)

    return presenter.go()
  }
}

module.exports = ListRegimesService
