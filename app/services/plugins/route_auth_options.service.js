'use strict'

/**
 * @module RouteAuthOptionsService
 */

class RouteAuthOptionsService {
  static go (route, environment) {
    let options = {}

    if (this._rootPath(route.path)) {
      options = this._noAuthOptions()
    } else if (this._protectRoute(route, environment)) {
      options = this._authOptions()
    }

    return {
      ...route,
      ...options
    }
  }

  static _authOptions () {
    return { options: { auth: { scope: ['admin'] } } }
  }

  static _noAuthOptions () {
    return { options: { auth: false } }
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

  static _rootPath (path) {
    return ['/', '/status'].includes(path)
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

module.exports = RouteAuthOptionsService
