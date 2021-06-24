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
        'lineAreaCode',
        'lineAttr1',
        'lineAttr2',
        'ruleset',
        'chargeFinancialYear',
        'invoiceId',
        'licenceId')
      .limit(1)
      .first()

    this._applyChargeValue(transactionTemplate, chargeValue)
    this._applyChargeCredit(transactionTemplate, chargeCredit)
    this._applyMinimumChargeFlags(transactionTemplate)
    this._applyLineDescription(transactionTemplate)

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
   * Set the subjectToMinimumCharge and minimumChargeAdjustment flags to true
   *
   * Minimum charge adjustment is only applied when an invoice has subjectToMinimumCharge set to true, so we would want the
   * adjustment transaction to have subjectToMinimumCharge set to true as well
   *
   * The minimumChargeAdjustment flag indicates that the transaction is an adjustment
   */
  static _applyMinimumChargeFlags (translator) {
    Object.assign(translator, {
      subjectToMinimumCharge: true,
      minimumChargeAdjustment: true
    })
  }

  /**
   * Assign the correct line description to the new minimum charge transaction record
   */
  static _applyLineDescription (translator) {
    Object.assign(
      translator, {
        lineDescription: 'Minimum Charge Calculation - raised under Schedule 23 of the Environment Act 1995'
      }
    )
  }
}

module.exports = CreateMinimumChargeAdjustmentService
