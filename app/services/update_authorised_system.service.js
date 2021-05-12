'use strict'

/**
 * @module UpdateAuthorisedSystemService
 */

const Boom = require('@hapi/boom')

const { AuthorisedSystemModel, RegimeModel } = require('../models')

const { AuthenticationConfig } = require('../../config')

class UpdateAuthorisedSystemService {
  /**
   * Update the details of an authorised system record
   *
   * Intended to be used with the `AuthorisedSystemsController.update()` action it allows us to update certain details
   * of an authorised system record.
   *
   * The request is first validated in a number of ways
   *
   * - the authorised system to be updated exists
   * - the request is not attempting to update the main 'admin' record
   * - if specified the new status is a recognised one
   * - if specified the new name is not 'admin' (there can be only one!)
   * - if specified the regimes listed are all recognised
   *
   * As the list infers, the update can be for one thing or all of them as long as its valid.
   *
   * ```
   * {
   *   "status": "inactive",
   *   "name": "Old WRLS Account",
   *   "regimes": ["cfd", "wrls"]
   * }
   * ```
   *
   * On regimes, the update
   * will replace the existing ones with whatever is specified. So, if for example the authorised system was linked to
   * 'cfd' and you also wanted to add 'wrls', your payload would need to be
   *
   * ```
   * {
   *   regimes: ['cfd', 'wrls']
   * }
   * ```
   *
   * @param {string} id Id of the authorised system to be updated
   * @param {Object} payload Details of the changes to be made to the autorised system
   */
  static async go (id, payload) {
    const authorisedSystem = await this._authorisedSystem(id)

    this._validateAuthorisedSystem(id, authorisedSystem)
    await this._validatePayload(payload)

    const patch = this._patch(payload)
    await this._update(authorisedSystem, patch, payload.regimes)
  }

  static _authorisedSystem (id) {
    return AuthorisedSystemModel.query()
      .findById(id)
      .withGraphFetched('regimes')
  }

  static _regimes (regimes, trx = null) {
    return RegimeModel.query(trx).select('id').whereIn('slug', regimes)
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

  static async _update (authorisedSystem, patch, regimes) {
    await AuthorisedSystemModel.transaction(async trx => {
      await authorisedSystem.$query(trx).patch(patch)

      if (regimes) {
        const result = await this._regimes(regimes, trx)
        await authorisedSystem.$relatedQuery('regimes', trx).unrelate()
        await authorisedSystem.$relatedQuery('regimes', trx).relate(result)
      }
    })
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
    if (payload.status && !['active', 'inactive'].includes(payload.status)) {
      throw Boom.badData(`${payload.status} is not valid a status. Can only be active or inactive.`)
    }
  }

  static _validatePayloadName (payload) {
    if (payload.name && payload.name.toLowerCase() === 'admin') {
      throw Boom.badData(`You cannot use the name ${payload.name}. There can be only one!`)
    }
  }

  static async _validatePayloadRegimes (payload) {
    if (payload.regimes) {
      const result = await this._regimes(payload.regimes)

      if (result.length !== payload.regimes.length) {
        throw Boom.badData('One or more of the regimes is unrecognised.')
      }
    }
  }
}

module.exports = UpdateAuthorisedSystemService
