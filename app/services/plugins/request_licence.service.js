'use strict'

/**
 * @module RequestLicenceService
 */

const Boom = require('@hapi/boom')

const LicenceModel = require('../../models/licence.model')

class RequestLicenceService {
  /**
   * Find a licence and determine if it's valid for the request.
   *
   * It checks that the request relates to a licence that exists. If this check fails a {@module Boom} error is thrown.
   *
   * @param {string} path The full request path. Used to determine if it's licence related
   * @param {string} licenceId The id of the requested licence
   *
   * @returns {Object} If the request is licence related and it's valid it returns an instance of
   * {@module LicenceModel}. Else it returns `null`
   */
  static async go (path, licenceId) {
    if (!this._licenceRelated(path)) {
      return null
    }

    const licence = await this._licence(licenceId)
    this._validateLicence(licence, licenceId)

    return licence
  }

  static _licenceRelated (path) {
    return /\/licences\//i.test(path)
  }

  static _licence (licenceId) {
    return LicenceModel.query().findById(licenceId)
  }

  static _validateLicence (licence, licenceId) {
    if (!licence) {
      throw Boom.notFound(`Licence ${licenceId} is unknown.`)
    }
  }
}

module.exports = RequestLicenceService
