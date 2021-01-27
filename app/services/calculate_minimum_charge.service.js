'use strict'

/**
 * @module CalculateMinimumChargeService
 */

// Files in the same folder cannot be destructured from index.js so have to be required directly
const CreateMinimumChargeAdjustmentService = require('./create_minimum_charge_adjustment.service')

const MINIMUM_CHARGE_LIMIT = 2500

class CalculateMinimumChargeService {
  /**
   * Determines whether minimum charge applies to the licences on the provided bill run.
   */
  static async go (billRun) {
    const minimumChargeLicences = await this._retrieveMinimumChargeLicences(billRun)
    const adjustments = await this._createAdjustmentTransactions(minimumChargeLicences)
    return adjustments
  }

  // TODO: Document
  // TODO: Select only fields we need
  static async _retrieveMinimumChargeLicences (billRun) {
    return billRun.$relatedQuery('invoices')
      .modify('minimumCharge')
      .withGraphFetched('licences')
  }

  static async _createAdjustmentTransactions (licences) {
    const adjustments = []

    for (const licence of licences) {
      const creditAdjustment = await this._adjustment(licence, licence.creditValue, true)
      const debitAdjustment = await this._adjustment(licence, licence.debitValue, false)

      if (creditAdjustment !== null) {
        adjustments.push(creditAdjustment)
      }

      if (debitAdjustment !== null) {
        adjustments.push(debitAdjustment)
      }
    }

    return adjustments
  }

  static async _adjustment (licence, value, credit) {
    if (value === 0) { return null }
    if (value >= MINIMUM_CHARGE_LIMIT) { return null }
    const adjustmentValue = MINIMUM_CHARGE_LIMIT - value
    return CreateMinimumChargeAdjustmentService.go(licence, adjustmentValue, credit)
  }
}

module.exports = CalculateMinimumChargeService
