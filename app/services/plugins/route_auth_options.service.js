'use strict'

/**
 * @module RouteAuthOptionsService
 */

class RouteAuthOptionsService {
  /**
   * Determine if a route needs any auth config assigned via the
   * {@link https://hapi.dev/api/?v=20.1.3#route-options|route.options} property
   *
   * By default all our 'routes' require authentication via a valid JWT in the request header. Some don't such as our
   * root `/` and `/status` endpoints. All our `/admin/...` endpoints require not only a valid JWT, but one created
   * by the admin user. Finally, in some special cases, we may put an endpoint in the `/admin` scope, for example, if
   * it's not yet ready for use, but only when running in certain environments!
   *
   * These exceptions are controlled by adding the property `options` to a route and then configuring its
   * {@link https://hapi.dev/api/?v=20.1.3#-routeoptionsauth|auth} property appropriately.
   *
   * To simplify things and avoid duplication we created this service which can check if a route is an exception,
   * depending on the current environment, and therefore assign the correct `options` config.
   *
   * If the route is standard, i.e. no additional config is required it simply returns the route unchanged.
   *
   * @param {Object} route The route to be checked if an auth options property is needed
   * @param {string} environment The current environment ('dev', 'tst', 'tra', 'pre' or 'prd')
   *
   * @returns {Object} a route that either matches what was passed in, or with a new `options` property with the correct
   * auth scope set
   */
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
