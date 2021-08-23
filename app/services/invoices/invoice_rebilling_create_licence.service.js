'use strict'

/**
 * @module InvoiceRebillingCreateLicenceService
 */

const { LicenceModel } = require('../../models')

class InvoiceRebillingCreateLicenceService {
  /**
   * Creates a licence on the specified invoice with the specified licence number.
   *
   * @param {module:InvoiceModel} invoice The invoice that the licence is to be created on.
   * @param {string} licenceNumber The licence number that the licence should be created with.
   * @param {Object} [trx] Optional DB transaction this is being performed as part of.
   * @returns {module:LicenceModel} An instance of `LicenceModel` for the newly-created and persisted licence.
   */
  static async go (invoice, licenceNumber, trx = null) {
    return LicenceModel.query(trx)
      .insert({
        invoiceId: invoice.id,
        billRunId: invoice.billRunId,
        licenceNumber
      })
  }
}

module.exports = InvoiceRebillingCreateLicenceService
