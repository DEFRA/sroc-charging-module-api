'use strict'

/**
 * @module DeleteInvoiceService
 */

const { BillRunModel } = require('../models')

class DeleteBillRunService {
  /**
   * Deletes a bill run along with its invoices, licences and transactions. Note there is no validation performed on the
   * bill run before deletion; when this service is accessed via a controller, the bill run's status will already have
   * been validated to ensure the bill run is editable.
   *
   * @param {@module:BillRunModel} billRun The bill run to be deleted.
   */
  static async go (billRun) {
    await BillRunModel
      .query()
      .deleteById(billRun.id)
  }
}

module.exports = DeleteBillRunService
