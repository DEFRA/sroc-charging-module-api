'use strict'

const { BillRunModel } = require('../models')
const { BillRunTranslator } = require('../translators')
const { JsonPresenter } = require('../presenters')

class CreateBillRunService {
  static async go (payload, authorisedSystem, regime) {
    const translator = new BillRunTranslator(payload)
    const billRun = await this._create(translator, authorisedSystem, regime)

    return this._response(billRun)
  }

  static async _create (translator, authorisedSystem, regime) {
    return BillRunModel.query()
      .insert({
        region: translator.region,
        regimeId: regime.id,
        createdBy: authorisedSystem.id,
        status: 'initialised'
      })
      .returning('*')
  }

  static async _response (billRun) {
    const presenter = new JsonPresenter(billRun)

    return presenter.go()
  }
}

module.exports = CreateBillRunService
