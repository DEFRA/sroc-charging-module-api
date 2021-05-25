'use strict'

/**
 * @module FilterRoutesService
 */

class FilterRoutesService {
  static go (routes, environment) {
    if (this._protectedEnvironment(environment)) {
      return this._filteredRoutes(routes)
    }

    return routes
  }

  static _protectedEnvironment (environment) {
    return ['pre', 'prd'].includes(environment)
  }

  static _filteredRoutes (routes) {
    return routes.filter(route => !this._pathsToBeFiltered().includes(route.path))
  }

  /**
   * Returns an array of strings, each of which is a path, for example,
   * `'/v2/{regimeId}/bill-runs/{billRunId}/invoices/{invoiceId}/rebill'` which should be filtered out when registering
   * routes in a production environment.
   *
   * It is expected we'll generally add to this when we add a new endpoint, and then remove the path when the endpoint
   * is signed off and ready for use.
   *
   * @returns an array of 'paths' to be used when filtering the routes
   */
  static _pathsToBeFiltered () {
    return []
  }
}

module.exports = FilterRoutesService
