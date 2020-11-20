'use strict'

/**
 * @module AuthorisationService
 */

/**
 * Determine if a request is authorised to proceed
 *
 * Used by the `AuthorisationPlugin` to determine if a request can proceed. It has to cover a number of scenarios
 *
 * - requests to a public endpoint like `/status`
 * - requests to 'admin' only endpoints like `/admin/regimes`
 * - requests to a regime endpoint like `/v1/wrls/billruns`
 *
 * You don't need to be authenticated to access a public endpoint. So in those cases it handles both `user` and
 * `regimeSlug` being `null`.
 *
 * Only users where the `admin` flag is set to `true` can access our 'admin' endpoints. And you can only create admins
 * by directly adding them to the database! However, they can also access any regime endpoint irrespective of what
 * regime is specified. In these cases it handles `user` being instantiated but the `regimeSlug` being `null`.
 *
 * The final scenario is the most common. This is system users who will have authenticated successfully but their
 * `admin` flag will be false. They will be linked to a regime, but not necessarily the one being requested.
 *
 * In all cases it returns an `Object` which callers can use to determine if the request is authorised. It also contains
 * the matched instance of `RegimeModel` if the slug was specified and matched.
 *
 * ```
 * { authorised: false, regime: MatchedRegime }
 * ```
 *
 * @param {module:AuthorisedSystemModel} [user=null] An instance of `AuthorisedSystemModel` which represents the 'user'
 *  making the request
 * @param {string} [regimeSlug=null] The short-code (slug) for the regime the request is for.
 * @returns {Object} Returns an object which states whether the request is authorised and an instance of `RegimeModel`
 * if one was specified and matched
 */
class AuthorisationService {
  static async go (user = null, regimeSlug = null) {
    const result = { authorised: false, regime: null }
    if (this._endpointHasNoRegime(regimeSlug) || this._userIsAnAdmin(user)) {
      result.authorised = true
    } else {
      const regime = await this._userAuthorisedRegime(user, regimeSlug)
      if (regime) {
        result.authorised = true
        result.regime = regime
      }
    }

    return result
  }

  static _userIsAnAdmin (user) {
    return user.admin
  }

  static _endpointHasNoRegime (regimeSlug) {
    return (!regimeSlug)
  }

  static _userAuthorisedRegime (user, regimeSlug) {
    return user
      .$relatedQuery('regimes')
      .findOne({ slug: regimeSlug })
  }
}

module.exports = AuthorisationService
