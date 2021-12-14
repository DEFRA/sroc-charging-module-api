'use strict'

/**
 * @module GenerateBillRunValidationService
 */

const Boom = require('@hapi/boom')

class GenerateBillRunValidationService {
  /**
  * Validates that a bill run is in a state where it can be generated.
  *
  * @param {@module:BillRunModel} billRun Instance of the bill run to be generated
  * @returns {boolean} It returns true if validation succeeds, otherwise an error will have been thrown.
  */
  static async go (billRun) {
    await this._validateBillRun(billRun)
    return true
  }

  static _validateBillRun (billRun) {
    if (billRun.$pending()) {
      throw Boom.conflict(`Summary for bill run ${billRun.id} is being updated`)
    }

    if (billRun.$generated()) {
      throw Boom.conflict(`Summary for bill run ${billRun.id} has already been generated.`)
    }

    if (billRun.$empty()) {
      throw Boom.badData(`Summary for bill run ${billRun.id} cannot be generated because it has no transactions.`)
    }
  }
}

module.exports = GenerateBillRunValidationService
