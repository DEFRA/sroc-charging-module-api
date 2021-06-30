/**
 * @module ListRegimesService
 */

import RegimeModel from '../models/regime.model.js'
import JsonPresenter from '../presenters/json.presenter.js'

/**
 * Returns an array of regimes
 *
 * @returns {module:RegimeModel[]} an array of `RegimeModel` based on regimes currently in the database
 */
export default class ListRegimesService {
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
