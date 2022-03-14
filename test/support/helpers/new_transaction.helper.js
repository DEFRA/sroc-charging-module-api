'use strict'

const TransactionModel = require('../../../app/models/transaction.model')

const RulesServicePresrocTranslator = require('../../../app/translators/rules_service_presroc.translator')
const TransactionPresrocTranslator = require('../../../app/translators/transaction_presroc.translator')

const CreateTransactionTallyService = require('../../../app/services/transactions/create_transaction_tally.service')

const GeneralHelper = require('./general.helper')
const NewLicenceHelper = require('./new_licence.helper')

const { presroc: requestFixtures } = require('../fixtures/create_transaction')
const { presroc: chargeFixtures } = require('../fixtures/calculate_charge')

class NewTransactionHelper {
  /**
   * Create a transaction
   *
   * @param {module:LicenceModel} licence Licence the transaction is to be created on. If not specified then a new
   *  licence will be created.
   * @param {object} [overrides] JSON object of values which will override those generated by the helper. The primary
   *  source for the default values are the 'simple' request and 'rules service' fixtures. When specifying your
   *  overrides use the database names, for example, `lineAttr1` not `licenceNumber`
   *
   * @returns {module:TransactionModel} The newly created instance of `TransactionModel`.
   */
  static async create (licence, overrides = {}) {
    if (!licence) {
      licence = await NewLicenceHelper.create()
    } else {
      // Refresh the licence we've been passed to ensure any previous changes aren't overwritten
      licence = await licence.$query()
    }

    const transaction = await TransactionModel.query()
      .insert({
        ...this._defaultSimpleTransaction(licence.billRunId),
        ...this._defaultSimpleCharge(),
        billRunId: licence.billRunId,
        invoiceId: licence.invoiceId,
        licenceId: licence.id,
        ...overrides
      })
      .returning('*')

    const updatePatch = this._updatePatch(transaction)
    await NewLicenceHelper.update(licence, updatePatch)

    return transaction
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

  static _updatePatch (transaction) {
    // We already have CreateTransactionTallyService which does a great job of turning a transaction into the values
    // needed to updated at bill run/invoice/licence level, covering scenarios such as minimum charge, zero value etc.
    // We therefore use it here rather than reinvent the wheel.
    const { insertData } = CreateTransactionTallyService.go(transaction, 'licence')
    return insertData
  }
}

module.exports = NewTransactionHelper
