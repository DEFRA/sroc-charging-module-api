'use strict'

/**
 * @module ListRegimesService
 */

const { RegimeModel } = require('../models')
const { JsonPresenter } = require('../presenters')

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
