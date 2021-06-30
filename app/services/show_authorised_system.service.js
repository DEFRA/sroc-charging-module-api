/**
 * @module ShowAuthorisedSystemService
 */

import Boom from '@hapi/boom'

import AuthorisedSystemModel from '../models/authorised_system.model.js'
import JsonPresenter from '../presenters/json.presenter.js'

/**
 * Returns the authorised system with the matching Id
 *
 * If no matching authorised system is found it will throw a `Boom.notFound()` error (404)
 *
 * @param {string} id Id of the regime to find
 * @returns {module:AuthorisedSystemModel} an `AuthorisedSystemModel` if found else it will throw a Boom 404 error
 */
export default class ShowAuthorisedSystemService {
  static async go (id) {
    const authorisedSystem = await this._authorisedSystem(id)

    if (!authorisedSystem) {
      throw Boom.notFound(`No authorised system found with id ${id}`)
    }

    return this._response(authorisedSystem)
  }

  static _authorisedSystem (id) {
    return AuthorisedSystemModel.query()
      .findById(id)
      .withGraphFetched('regimes')
  }

  static _response (authorisedSystem) {
    const presenter = new JsonPresenter(authorisedSystem)

    return presenter.go()
  }
}
