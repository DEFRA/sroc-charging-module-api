const authConfig = require('../../../config/authentication.config')
const { AuthorisedSystemModel } = require('../../../app/models')

/**
 * Use to help with creating 'client' records
 *
 * Our clients are the systems permitted to use the API and they are recorded in the database as `AuthorisedSystems`.
 * We expect only one to be flagged as an admin client which is used by the delivery team for accessing endpoints on
 * the `/admin` path.
 *
 * Any others are expected to be our actual clients or 'users'
 */
class ClientHelper {
  /**
   * Create the admin client record
   *
   * @param {string} [id] If not set will default to the configured admin client ID.
   * @returns {Object} The result of the db insertion for your reference
   */
  static async addAdminClient (id) {
    const systemId = id || authConfig.adminClientId

    return this._insertClient(systemId, 'admin', true, 'active')
  }

  /**
   * Create non-admin client record
   *
   * @param {string} id ID you want set for the client
   * @param {name} name Name you want to set for the client
   * @returns {Object} The result of the db insertion for your reference
   */
  static async addClient (id, name) {
    return this._insertClient(id, name, false, 'active')
  }

  static async _insertClient (id, name, isAdmin, status) {
    return await AuthorisedSystemModel
      .query()
      .insert({
        id: id,
        name: name,
        admin: isAdmin,
        status: status
      })
      .returning('*')
  }
}

module.exports = ClientHelper
