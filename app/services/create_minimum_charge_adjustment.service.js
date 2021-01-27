'use strict'

/**
 * @module CreateMinimumChargeAdjustmentService
 */

class CreateMinimumChargeAdjustmentService {
  /**
   * Returns a minimum charge adjustment transaction. Note that the created transaction is not persisted in the db.
   *
   * @param {module:LicenceModel} licenceToAdjust Licence object which will have an adjustment transaction added
   * @param {integer} chargeValue The value in pence of the adjustment transaction
   * @param {boolean} chargeCredit True if the charge is a credit, false if it is a debit
   * @returns {module:TransactionModel} A `TransactionModel` instance representing the adjustment transaction
   */
  static async go (licenceToAdjust, chargeValue, chargeCredit) {
    // Get the first transaction for this licence as we will use it to get details like billRunId, regime etc. We
    // select only the fields we need to use as a template when we create the adjustment transaction, and we add
    // .limit(1) to ensure only 1 record is returned from the db.
    const transactionTemplate = await licenceToAdjust.$relatedQuery('transactions')
      .select('billRunId',
        'regimeId',
        'createdBy',
        'region',
        'customerReference',
        'lineAttr1',
        'lineAttr2',
        'lineDescription',
        'ruleset',
        'chargeFinancialYear')
      .limit(1)
      .first()

    this._applyChargeValue(transactionTemplate, chargeValue)
    this._applyChargeCredit(transactionTemplate, chargeCredit)
    this._applysubjectToMinimumChargeFlag(transactionTemplate)

    return transactionTemplate
  }

  /**
   * Assign the charge value passed to the service to the field chargeValue
   */
  static _applyChargeValue (translator, chargeValue) {
    Object.assign(translator, { chargeValue })
  }

  /**
   * Assign the charge credit boolean passed to the service to the field chargeCredit
   */
  static _applyChargeCredit (translator, chargeCredit) {
    Object.assign(translator, { chargeCredit })
  }

  /**
   * Set the subjectToMinimumCharge flag to true
   *
   * Minimum charge adjustment is only applied when an invoice has subjectToMinimumCharge set to true, so we would want the
   * adjustment transaction to have subjectToMinimumCharge set to true as well
   */
  static _applysubjectToMinimumChargeFlag (translator) {
    Object.assign(translator, { subjectToMinimumCharge: true })
  }
}

module.exports = CreateMinimumChargeAdjustmentService
