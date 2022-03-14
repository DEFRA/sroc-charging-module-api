'use strict'

const BillRunModel = require('../../../app/models/bill_run.model.js')

const AuthorisedSystemHelper = require('./authorised_system.helper.js')
const RegimeHelper = require('./regime.helper.js')

class NewBillRunHelper {
  /**
   * Create a bill run
   *
   * @param {string} [authorisedSystemId] Id to use for the `created_by` field. If not specified then an authorised
   *  system will be created with a random client id and name.
   * @param {string} [regimeId] Id to use for the `regime_id` field. If not specified then a regime will be created
   *  with slug `wrls` and name `WRLS`.
   * @param {object} [overrides] JSON object of values which will override the ones the helper defaults to. Without them
   *  the bill run will default to region `A` and status `initialised`.
   *
   * @returns {module:BillRunModel} The newly created instance of `BillRunModel`.
   */
  static async create (authorisedSystemId, regimeId, overrides = {}) {
    let regime

    if (!regimeId) {
      regime = await RegimeHelper.addRegime('wrls', 'WRLS')
      regimeId = regime.id
    }

    if (!authorisedSystemId) {
      const authorisedSystem = await AuthorisedSystemHelper.addSystem(this._randomString(9), this._randomString(7), [regime])
      authorisedSystemId = authorisedSystem.id
    }

    return BillRunModel.query()
      .insert({
        createdBy: authorisedSystemId,
        regimeId: regimeId,
        ...this._defaultBillRun(),
        ...overrides
      })
      .returning('*')
  }

  static _defaultBillRun () {
    return {
      region: 'A',
      status: 'initialised',
      ruleset: 'presroc'
    }
  }

  /**
   * Updates a bill run
   *
   * @param {module:BillRunModel} billRun The bill run to be updated.
   * @param {object} updates JSON object of values to be updated. Each value in the object will be added to the existing
   *  value in the bill run if it is a number (unless it's an exception such as billRunNumber); if it isn't a number
   *  then the existing value will be replaced.
   *
   * @returns {module:BillRunModel} The newly updated instance of `BillRunModel`.
   */
  static async update (billRun, updates = {}) {
    const patch = {}

    for (const [key, value] of Object.entries(updates)) {
      // If the field is "addable" then we add it to the existing number; otherwise we replace the existing value.
      if (this._addable(key, value)) {
        patch[key] = billRun[key] + value
      } else {
        patch[key] = value
      }
    }

    return billRun.$query()
      .patchAndFetch(patch)
  }

  /**
   * When updating an entity we either add or replace values. In general, we add anything that's a number (eg. counts
   * and values) and replace anything that isn't. However some numbers are an exception and we do want them to be
   * replaced. This function returns true if the passed key/value pair are suitable for adding and false if they aren't.
   */
  static _addable (key, value) {
    const isNumber = typeof value === 'number'
    const exception = ['billRunNumber', 'financialYear'].includes(key)
    return isNumber && !exception
  }

  /**
   * Mock generate a bill run
   *
   * We do not _actually_ generate a bill run with this helper. We simply update the bill run record to reflect what a
   * generated bill run would look like
   *
   * @param {string} billRunId Id of the bill run to update as 'generated'
   * @param {Object} [overrides] JSON object of values which will override those used by the helper. By default, this
   * helper will updated the `invoiceCount` to 1 and the `invoiceValue` to 5000. Use this to set other values, or to set
   * the credit note properties
   *
   * @returns {module:BillRunModel} An updated instance of `BillRunModel` for the bill run specified
   */
  static generateBillRun (billRunId, overrides = {}) {
    return BillRunModel.query()
      .findById(billRunId)
      .patch({
        ...this._defaultGenerateBillRunPatch(),
        ...overrides
      })
      .returning('*')
  }

  static _defaultGenerateBillRunPatch () {
    return {
      status: 'generated',
      invoiceCount: 1,
      invoiceValue: 5000
    }
  }

  /**
   * Generates a random string (a-z) of a given length
   */
  static _randomString (length) {
    // Create an array with `length` empty elements
    return [...Array(length)]
      // Populate each element with a random number from 0-25
      .map(() => Math.floor(Math.random() * 25))
      // Convert each number to a letter by adding 97 to get the ASCII character (97 = 'a', 98 = 'b' etc.)
      .map(char => String.fromCharCode(97 + char))
      // Join the array elements together to form a string
      .join('')
  }
}

module.exports = NewBillRunHelper
