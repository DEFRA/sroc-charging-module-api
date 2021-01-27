'use strict'

/**
 * @module CalculateMinimumChargeService
 */

// Files in the same folder cannot be destructured from index.js so have to be required directly
const CreateMinimumChargeAdjustmentService = require('./create_minimum_charge_adjustment.service')

const MINIMUM_CHARGE_LIMIT = 2500

class CalculateMinimumChargeService {
  /**
   * Calculates and returns minimum charge adjustment transactions for all licences under a bill run.
   *
   * @param {module:BillRunModel} Bill run to create minimum charge transactions for.
   * @returns {array} All created minimum charge transactions for the provided bill run.
   */
  static async go (billRun) {
    const minimumChargeInvoices = await this._retrieveMinimumChargeInvoices(billRun)
    const licences = this._extractLicences(minimumChargeInvoices)
    return this._createAdjustmentTransactions(licences)
  }

  static async _retrieveMinimumChargeInvoices (billRun) {
    // We .select('') so that only the licences list of each invoice is returned
    return billRun.$relatedQuery('invoices')
      .modify('minimumCharge')
      .withGraphFetched('licences')
      .select('')
  }

  /**
   * Return a flattened array of licences under the invoice array passed to the function
   */
  static _extractLicences (invoices) {
    return invoices.map(invoice => invoice.licences).flat()
  }

  /**
   * Iterate over every licence and generate any needed minimum charge adjustments
   */
  static async _createAdjustmentTransactions (licences) {
    const adjustments = []

    /**
     * Generate credit and debit adjustments and add them to the adjustments array.
     * If no adjustment is needed then null will be added -- we will filter these out before we return.
     */
    for (const licence of licences) {
      adjustments.push(await this._adjustment(licence, licence.creditValue, true))
      adjustments.push(await this._adjustment(licence, licence.debitValue, false))
    }

    return adjustments.filter(transaction => transaction)
  }

  static async _adjustment (licence, value, credit) {
    if (value === 0) {
      return null
    }

    if (value >= MINIMUM_CHARGE_LIMIT) {
      return null
    }

    const adjustmentValue = MINIMUM_CHARGE_LIMIT - value
    return CreateMinimumChargeAdjustmentService.go(licence, adjustmentValue, credit)
  }
}

module.exports = CalculateMinimumChargeService
