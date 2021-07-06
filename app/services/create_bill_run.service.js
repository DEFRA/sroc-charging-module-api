/**
 * @module CreateBillRunService
 */

import BillRunModel from '../models/bill_run.model.js'
import BillRunTranslator from '../translators/bill_run.translator.js'
import CreateBillRunPresenter from '../presenters/create_bill_run.presenter.js'
import NextBillRunNumberService from './next_bill_run_number.service.js'

/**
 * Creates a new bill run record
 *
 * The service handles validating and translating the request to the API and then creating a new bill run for the
 * selected regime. It then returns a representation of the new bill run to be used in the response.
 *
 * @param {Object} payload The payload from the API request
 * @param {module:AuthorisedSystemModel} authorisedSystem Instance of `AuthorisedSystemModel' representing the
 *  authenticated user
 * @param {module:RegimeModel} regime Instance of `RegimeModel` representing the regime we are creating the bill run for
 *
 * @returns {Object} Details of the newly created bill run record
 */
export default class CreateBillRunService {
  static async go (payload, authorisedSystem, regime) {
    const translator = this._translateRequest(payload, authorisedSystem, regime)
    const billRun = await this._create(translator)

    return this._response(billRun)
  }

  static _translateRequest (payload, authorisedSystem, regime) {
    return new BillRunTranslator({
      ...payload,
      regimeId: regime.id,
      authorisedSystemId: authorisedSystem.id
    })
  }

  static async _create (translator) {
    return BillRunModel.transaction(async () => {
      const billRunNumber = await NextBillRunNumberService.go(translator.regimeId, translator.region)
      return BillRunModel.query()
        .insert({
          ...translator,
          billRunNumber
        })
        .returning('*')
    })
  }

  static async _response (billRun) {
    const presenter = new CreateBillRunPresenter(billRun)

    return presenter.go()
  }
}
