'use strict'

/**
 * @module DeleteInvoiceService
 */

const { BillRunModel } = require('../models')

class DeleteBillRunService {
  /**
   * Deletes a bill run along with its invoices, licences and transactions.
   *
   * @param {string} billRunId The id of the bill run to be deleted.
   */
  static async go (billRunId) {
    // First ensure we can delete the bill run!
    await BillRunModel
      .query()
      .deleteById(billRunId)
  }
}

module.exports = DeleteBillRunService
