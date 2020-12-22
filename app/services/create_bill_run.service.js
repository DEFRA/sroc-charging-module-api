'use strict'

/**
 * @module CreateBillRunService
 */

const { BillRunModel } = require('../models')
const { BillRunTranslator } = require('../translators')
const { CreateBillRunPresenter } = require('../presenters')

// Files in the same folder cannot be destructured from index.js so have to be required directly
const NextBillRunNumberService = require('./next_bill_run_number.service')

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
    const translator = new BillRunTranslator({
      ...payload,
      regimeId: regime.id,
      authorisedSystemId: authorisedSystem.id
    })
    const billRun = await this._create(translator)

    return this._response(billRun)
  }

  static async _create (translator) {
    return BillRunModel.transaction(async () => {
      const billRunNumber = await NextBillRunNumberService.go(translator.regimeId, translator.region)
      return BillRunModel.query()
        .insert({
          billRunNumber,
          region: translator.region,
          regimeId: translator.regimeId,
          createdBy: translator.createdBy,
          status: 'initialised'
        })
        .returning('*')
    })
  }

  static async _response (billRun) {
    const presenter = new CreateBillRunPresenter(billRun)

    return presenter.go()
  }
}

module.exports = CreateBillRunService
