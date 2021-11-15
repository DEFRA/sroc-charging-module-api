'use strict'

const { TransactionModel } = require('../../../app/models')
const { RulesServicePresrocTranslator, TransactionPresrocTranslator } = require('../../../app/translators')

const GeneralHelper = require('./general.helper')
const LicenceHelper = require('./licence.helper')

const { presroc: requestFixtures } = require('../fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../fixtures/calculate_charge')

class TransactionHelper {
  /**
   * Create a transaction. If overrides does not specify licenceId and invoiceId then a new licence will be created
   * (which in turn will create a new invoice).
   *
   * @param {string} billRunId Id of an actual bill run. We have a foreign key constraint which forces this requirement
   * @param {object} [overrides] JSON object of values which will override those generated by the helper. The primary
   *  source for the default values are the 'simple' request and 'rules service' fixtures. When specifying your
   *  overrides use the database names, for example, `lineAttr1` not `licenceNumber`
   *
   * @returns {module:TransactionModel} The newly created instance of `TransactionModel`.
   */
  static async addTransaction (billRunId, overrides = {}) {
    return TransactionModel.query()
      .insert({
        ...this._defaultSimpleTransaction(billRunId),
        ...this._defaultSimpleCharge(),
        // If a licence id isn't specified in overrides then create a new licence and invoice and include their ids
        ...!overrides.licenceId ? await this._newLicenceAndInvoice(billRunId, overrides) : {},
        ...overrides
      })
      .returning('*')
  }

  static _defaultSimpleTransaction (billRunId) {
    return new TransactionPresrocTranslator({
      billRunId,
      ...requestFixtures.simple,
      regimeId: GeneralHelper.uuid4(),
      authorisedSystemId: GeneralHelper.uuid4()
    })
  }

  static _defaultSimpleCharge () {
    return new RulesServicePresrocTranslator({
      ...chargeFixtures.simple.rulesService
    })
  }

  /**
   * Creates a new licence (and in turn a new invoice) and returns their ids.
   */
  static async _newLicenceAndInvoice (billRunId, overrides) {
    const { id: licenceId, invoiceId } = await LicenceHelper.addLicence(
      billRunId, 'LICENCE', null, requestFixtures.simple.customerReference, 2019
    )

    return {
      licenceId,
      invoiceId
    }
  }
}

module.exports = TransactionHelper
