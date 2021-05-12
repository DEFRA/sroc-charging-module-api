'use strict'

/**
 * @module UpdateAuthorisedSystemService
 */

const Boom = require('@hapi/boom')

const { AuthorisedSystemModel } = require('../models')

const { AuthenticationConfig } = require('../../config')

class UpdateAuthorisedSystemService {
  static async go (id, payload) {
    const authorisedSystem = await this._authorisedSystem(id)

    this._validate(id, authorisedSystem)
    this._validatePayload(payload)
  }

  static _authorisedSystem (id) {
    return AuthorisedSystemModel.query()
      .findById(id)
      .withGraphFetched('regimes')
  }

  static _validate (id, authorisedSystem) {
    if (!authorisedSystem) {
      throw Boom.notFound(`No authorised system found with id ${id}`)
    }
    if (authorisedSystem.clientId === AuthenticationConfig.adminClientId) {
      throw Boom.conflict('You cannot update the main admin.')
    }
  }

  static _validatePayload (payload) {
    // Unlike `POST` requests PATCH requests are not checked for a payload because we specifically use them in
    // situations where no payload is expected, for example, approving a bill run. In this instance we do expect a
    // payload which is why we have the check.
    if (!payload) {
      throw Boom.badData('The payload was empty.')
    }
    if (payload.status) {
      if (!['active', 'inactive'].includes(payload.status)) {
        throw Boom.badData(`${payload.status} is not valid a status. Can only be active or inactive.`)
      }
    }
  }
}

module.exports = UpdateAuthorisedSystemService
