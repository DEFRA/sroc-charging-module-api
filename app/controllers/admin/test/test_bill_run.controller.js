'use strict'

const { RegimeModel } = require('../../../models')
const { CreateBillRunService } = require('../../../services')

class TestBillRunController {
  static async generate (req, h) {
    const regime = await TestBillRunController._findRegime(req.params.regimeId)
    const result = await CreateBillRunService.go(req.payload, req.auth.credentials.user, regime)

    return h.response(result).code(201)
  }

  /**
   * Find the regime based on regime 'slug' used in request path
   *
   * For our normal endpoints the regime is pre-loaded into Hapi's `request.app` space by the `AuthorisationPlugin`. But
   * this endpoint is only acessible by an `admin` user who is not linked to any regimes, as it can access them all.
   *
   * So, the request will be authorised but the authorisation plugin won't have returned a regime. This is why we need
   * to find it within the controller as part of the request.
   *
   * @param {string} regimeSlug The regime 'slug' used in the request path
   *
   * @returns {module:RegimeModel} An instance of `RegimeModel` for the matching regime
   */
  static _findRegime (regimeSlug) {
    return RegimeModel.query().findOne({ slug: regimeSlug })
  }
}

module.exports = TestBillRunController
