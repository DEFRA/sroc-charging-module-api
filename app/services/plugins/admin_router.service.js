'use strict'

/**
 * @module AdminRouterService
 */

class AdminRouterService {
  static go (route, environment) {
    if (this._protectRoute(route, environment)) {
      route.options = this._authOptions()
    }

    return route
  }

  static _authOptions () {
    return { auth: { scope: ['admin'] } }
  }

  static _protectRoute (route, environment) {
    if (this._adminPath(route.path)) {
      return true
    }
    if (this._protectedEnvironment(environment) && this._protectedPath(route.path)) {
      return true
    }

    return false
  }

  static _adminPath (path) {
    return /\/admin\//i.test(path)
  }

  static _protectedEnvironment (environment) {
    return ['pre', 'prd'].includes(environment)
  }

  static _protectedPath (path) {
    return [].includes(path)
  }
}

module.exports = AdminRouterService
