'use strict'

/**
 * @module RequestBillRunService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../../models')

class RequestBillRunService {
  /**
   * Find a bill run and determine if it's valid for the request.
   *
   * We have a number of services that
   *
   * - first need to find a matching bill run
   * - perform some initial validation
   * - perform validation specific to the service
   *
   * As the number of services grew, so to did the duplication of the first two actions across them. This service and
   * the {@module BillRunPlugin} were created to remove the duplication and simplify the project.
   *
   * It carries out the following checks
   *
   * - that the request relates to an existing bill run (`POST` a new bill run is ignored)
   * - that we can find the bill run
   * - the bill run is linked to the requested regime which ensures the client system has access to it
   * - that if the request involves editing the bill run its status is such that it can be changed
   *
   * If any of these checks fail the relevant {@module Boom} error is thrown.
   *
   * @param {string} path The full request path. Used to determine if its bill-run related
   * @param {string} method The request method, for example, `get` or `post`
   * @param {@module RegimeModel} regime An instance of {@module RegimeModel} which matches the requested regime
   * @param {string} billRunId The id of the requested bill run
   *
   * @returns {Object} If the request is bill run related and it's valid it returns an instance of
   * {@module BillRunModel}. Else it returns `null`
   */
  static async go (path, method, regime, billRunId) {
    if (!this._billRunRelated(path)) {
      return null
    }

    const billRun = await this._billRun(billRunId)
    this._validateBillRun(billRun, billRunId, regime, method)

    return billRun
  }

  static _billRunRelated (path) {
    return /\/bill-runs\//i.test(path)
  }

  static _billRun (billRunId) {
    return BillRunModel.query().findById(billRunId)
  }

  static _validateBillRun (billRun, billRunId, regime, method) {
    if (!billRun) {
      throw Boom.notFound(`Bill run ${billRunId} is unknown.`)
    }

    if (billRun.regimeId !== regime.id) {
      throw Boom.badData(`Bill run ${billRunId} is not linked to regime ${regime.slug}.`)
    }

    if (!billRun.$editable() && method !== 'get') {
      throw Boom.conflict(`Bill run ${billRun.id} cannot be edited because its status is ${billRun.status}.`)
    }
  }
}

module.exports = RequestBillRunService
