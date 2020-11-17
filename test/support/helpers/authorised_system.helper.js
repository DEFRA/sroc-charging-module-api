'use strict'

const { AuthenticationConfig } = require('../../../config')
const { AuthorisedSystemModel } = require('../../../app/models')

/**
 * Use to help with creating `AuthorisedSystem` records
 *
 * Our clients are the systems permitted to use the API and they are recorded in the database as `AuthorisedSystems`.
 * We expect only one to be flagged as an admin client which is used by the delivery team for accessing endpoints on
 * the `/admin` path.
 *
 * Any others are expected to be our actual clients or 'users'
 */
class AuthorisedSystemHelper {
  /**
   * Create the admin system record
   *
   * @param {string} [clientId] If not set will default to the configured admin client ID.
   * @returns {Object} The result of the db insertion for your reference
   */
  static async addAdminSystem (clientId) {
    const systemId = clientId || AuthenticationConfig.adminClientId

    return this._insertSystem(systemId, 'admin', true, 'active')
  }

  /**
   * Create non-admin system record
   *
   * @param {string} clientId Client ID you want set for the system
   * @param {name} name Name you want to set for the system
   * @returns {Object} The result of the db insertion for your reference
   */
  static async addSystem (clientId, name) {
    return this._insertSystem(clientId, name, false, 'active')
  }

  static async _insertSystem (clientId, name, isAdmin, status) {
    return await AuthorisedSystemModel
      .query()
      .insert({
        client_id: clientId,
        name: name,
        admin: isAdmin,
        status: status
      })
      .returning('*')
  }
}

module.exports = AuthorisedSystemHelper
