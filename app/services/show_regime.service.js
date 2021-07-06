/**
 * @module ShowRegimeService
 */

import Boom from '@hapi/boom'

import RegimeModel from '../models/regime.model.js'
import JsonPresenter from '../presenters/json.presenter.js'

/**
 * Returns the regime with matching Id
 *
 * If no matching regime is found it will throw a `Boom.notFound()` error (404)
 *
 * @param {string} id Id of the regime to find
 * @returns {module:RegimeModel} a `RegimeModel` if found else it will throw a B
 */
export default class ShowRegimeService {
  static async go (id) {
    const regime = await this._regime(id)

    if (!regime) {
      throw Boom.notFound(`No regime found with id ${id}`)
    }

    return this._response(regime)
  }

  static _regime (id) {
    return RegimeModel.query()
      .findById(id)
      .withGraphFetched('authorisedSystems')
  }

  static _response (regime) {
    const presenter = new JsonPresenter(regime)

    return presenter.go()
  }
}
