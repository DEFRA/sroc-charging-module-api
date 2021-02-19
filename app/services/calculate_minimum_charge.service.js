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

  /**
   * The bill run we receive will have one or more invoices, each of which will contain one or more licences.
   * Minimum charge is applied at a licence level so we need to fetch these from the database.
   *
   * We start by pulling the invoices related to the bill run from the database using .$relatedQuery('invoices').
   * We use .modify('minimumCharge') to select only those invoices where minimum charge applies (see InvoiceModel for
   *  details on how the modifier works).
   * We use .withGraphFetched('licences') to also pull the licences connected to each invoice.
   * We use .select('') so that nothing else about the invoice is retrieved from the database, just the linked licences.
   * We therefore return an array of InvoiceModel objects, each of which contains just a key containing the linked
   * licences.
   */
  static async _retrieveMinimumChargeInvoices (billRun) {
    return billRun.$relatedQuery('invoices')
      .modify('minimumCharge')
      .withGraphFetched('licences')
      .select('')
  }

  /**
   * At this stage we have an array of invoices, each of which contains an array of licences. This function returns a
   * flattened array of all the licences within the invoice array.
   */
  static _extractLicences (invoices) {
    return invoices.map(invoice => invoice.licences).flat()
  }

  /**
   * Iterate over every licence and generate any needed minimum charge adjustments
   */
  static async _createAdjustmentTransactions (licences) {
    const adjustments = []

    // Generate credit and debit adjustments if needed and add them to the adjustments array.
    // In some scenarios null will be added to the array -- we will filter these out before we return.
    for (const licence of licences) {
      if (licence.subjectToMinimumChargeCreditValue) {
        adjustments.push(await this._adjustment(licence, licence.creditLineValue, true))
      }

      if (licence.subjectToMinimumChargeDebitValue) {
        adjustments.push(await this._adjustment(licence, licence.debitLineValue, false))
      }
    }

    // Filter null from the adjustments array and return
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
