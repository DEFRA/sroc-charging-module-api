/**
 * @module ListAuthorisedSystemsService
 */

const { AuthorisedSystemModel } = require('../models')
const { JsonPresenter } = require('../presenters')

/**
 * Returns an array of authorised systems
 *
 * @returns {module:AuthorisedSystemModel[]} an array of `AuthorisedSystemModel` based on authorised systems currently
 * in the database
 */
class ListAuthorisedSystemsService {
  static async go () {
    const authorisedSystems = await this._authorisedSystems()

    return this._response(authorisedSystems)
  }

  static _authorisedSystems () {
    return AuthorisedSystemModel
      .query()
  }

  static _response (authorisedSystems) {
    const presenter = new JsonPresenter(authorisedSystems)

    return presenter.go()
  }
}

module.exports = ListAuthorisedSystemsService
