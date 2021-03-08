'use strict'

/**
 * @module DeleteInvoiceService
 */

const { BillRunModel } = require('../models')

class DeleteBillRunService {
  /**
   * Deletes a bill run along with its invoices, licences and transactions.
   *
   * @param {@module:BillRunModel} billRun The bill run to be deleted.
   */
  static async go (billRun) {
    // First ensure we can delete the bill run!
    await BillRunModel
      .query()
      .deleteById(billRun.id)
  }
}

module.exports = DeleteBillRunService
