'use strict'

/**
 * @module RequestBillRunService
 */

const Boom = require('@hapi/boom')

const BillRunModel = require('../../models/bill_run.model.js')

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
   * - that if the request involves changing the bill run its status is such that it can be changed (note that we do not
   *   perform this check if the request path contains `/admin/` to allow eg. retrying transaction file generation of a
   *   pending bill run.)
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
    if (!this._billRunRelatedPath(path)) {
      return null
    }

    const billRun = await this._billRun(billRunId)
    this._validateBillRun(billRun, billRunId, regime, method)
    this._validateCanUpdateBillRun(billRun, path, method)

    return billRun
  }

  static _billRunRelatedPath (path) {
    return /\/bill-runs\//i.test(path)
  }

  static _billRun (billRunId) {
    return BillRunModel.query().findById(billRunId)
  }

  /**
   * Validate that the bill run exists and is linked to the specified regime.
   */
  static _validateBillRun (billRun, billRunId, regime) {
    if (!billRun) {
      throw Boom.notFound(`Bill run ${billRunId} is unknown.`)
    }

    if (billRun.regimeId !== regime.id) {
      throw Boom.badData(`Bill run ${billRunId} is not linked to regime ${regime.slug}.`)
    }
  }

  /**
   * Validate that the bill run can be updated if the http method is one that requires it to be changed
   *
   * If the request is a `PATCH` for a 'billed' bill run we need to reject it. Same for a `POST` or `DELETE` request
   * for an 'approved' bill run.
   *
   * This method determines the validation to apply based on the request type.
   */
  static _validateCanUpdateBillRun (billRun, path, method) {
    switch (method) {
      case 'get':
        // No validation is required if the request just a GET
        break
      case 'patch':
        this._validateCanPatchBillRun(billRun, path)
        break
      default:
        this._validateCanEditBillRun(billRun)
    }
  }

  static _validateCanPatchBillRun (billRun, path) {
    const adminPath = this._adminPath(path)

    if (!adminPath && !billRun.$patchable()) {
      throw Boom.conflict(`Bill run ${billRun.id} cannot be patched because its status is ${billRun.status}.`)
    }
  }

  static _validateCanEditBillRun (billRun) {
    if (!billRun.$editable()) {
      throw Boom.conflict(`Bill run ${billRun.id} cannot be edited because its status is ${billRun.status}.`)
    }
  }

  static _adminPath (path) {
    return /\/admin\//i.test(path)
  }
}

module.exports = RequestBillRunService
