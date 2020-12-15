'use strict'

/**
 * @module CreateBillRunService
 */

const { BillRunModel } = require('../models')
const { BillRunTranslator } = require('../translators')
const { JsonPresenter } = require('../presenters')

// Files in the same folder cannot be destructured from index.js so have to be required directly
const GetNextSequenceCounterService = require('./get_next_sequence_counter.service')

/**
 * Creates a new bill run record
 *
 * The service handles validating and translating the request to the API and then creating a new bill run for the
 * selected regime. It then returns the new bill run as the result.
 *
 * @param {Object} payload The payload from the API request
 * @param {module:AuthorisedSystemModel} authorisedSystem Instance of `AuthorisedSystemModel' representing the
 *  authenticated user
 * @param {module:RegimeModel} regime Instance of `RegimeModel` representing the regime we are creating the bill run for
 *
 * @returns {Object} Details of the newly created bill run record
 */
class CreateBillRunService {
  static async go (payload, authorisedSystem, regime) {
    const translator = new BillRunTranslator(payload)
    const billRun = await this._create(translator, authorisedSystem, regime)

    return this._response(billRun)
  }

  static async _create (translator, authorisedSystem, regime) {
    return BillRunModel.transaction(async trx => {
      const billRunNumber = await GetNextSequenceCounterService.go(regime.id, translator.region)
      return BillRunModel.query()
        .insert({
          region: translator.region,
          regimeId: regime.id,
          billRunNumber,
          createdBy: authorisedSystem.id,
          status: 'initialised'
        })
        .returning('*')
    })
  }

  static async _response (billRun) {
    const presenter = new JsonPresenter(billRun)

    return presenter.go()
  }
}

module.exports = CreateBillRunService
