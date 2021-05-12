'use strict'

/**
 * @module UpdateAuthorisedSystemService
 */

const Boom = require('@hapi/boom')

const { AuthorisedSystemModel, RegimeModel } = require('../models')

const { AuthenticationConfig } = require('../../config')

class UpdateAuthorisedSystemService {
  static async go (id, payload) {
    const authorisedSystem = await this._authorisedSystem(id)

    this._validateAuthorisedSystem(id, authorisedSystem)
    await this._validatePayload(payload)

    const patch = this._patch(payload)
    await this._update(authorisedSystem, patch)
  }

  static _authorisedSystem (id) {
    return AuthorisedSystemModel.query()
      .findById(id)
      .withGraphFetched('regimes')
  }

  static _patch (payload) {
    const patch = {}
    if (payload.status) {
      patch.status = payload.status
    }
    if (payload.name) {
      patch.name = payload.name
    }

    return patch
  }

  static async _update (authorisedSystem, patch) {
    await authorisedSystem.$query().patch(patch)
  }

  static _validateAuthorisedSystem (id, authorisedSystem) {
    if (!authorisedSystem) {
      throw Boom.notFound(`No authorised system found with id ${id}`)
    }
    if (authorisedSystem.clientId === AuthenticationConfig.adminClientId) {
      throw Boom.conflict('You cannot update the main admin.')
    }
  }

  static async _validatePayload (payload) {
    // Unlike `POST` requests PATCH requests are not checked for a payload because we specifically use them in
    // situations where no payload is expected, for example, approving a bill run. In this instance we do expect a
    // payload which is why we have the check.
    if (!payload) {
      throw Boom.badData('The payload was empty.')
    }
    this._validatePayloadStatus(payload)
    this._validatePayloadName(payload)
    await this._validatePayloadRegimes(payload)
  }

  static _validatePayloadStatus (payload) {
    if (payload.status) {
      if (!['active', 'inactive'].includes(payload.status)) {
        throw Boom.badData(`${payload.status} is not valid a status. Can only be active or inactive.`)
      }
    }
  }

  static _validatePayloadName (payload) {
    if (payload.name) {
      if (payload.name.toLowerCase() === 'admin') {
        throw Boom.badData(`You cannot use the name ${payload.name}. There can be only one!`)
      }
    }
  }

  static async _validatePayloadRegimes (payload) {
    if (payload.regimes) {
      const result = await RegimeModel.query().count('id').whereIn('slug', payload.regimes)

      if (result[0].count !== payload.regimes.length) {
        throw Boom.badData('One or more of the regimes is unrecognised.')
      }
    }
  }
}

module.exports = UpdateAuthorisedSystemService
