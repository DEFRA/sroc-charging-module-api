'use strict'

/**
 * @module DeleteInvoiceService
 */

const { BillRunModel } = require('../models')

class DeleteBillRunService {
  /**
   * Deletes a bill run along with its invoices, licences and transactions
   *
   * Because deleting large bill runs can take some time, the service first updates the bill runs status to `deleting`
   * just in case someone else attempts to view the bill run at the same time. It then tells PostgreSQL to delete the
   * bill run. Invoices, licences and transactions are all automatically handled because the DB is configured to cascade
   * delete them.
   *
   * Note - There is no validation performed on the bill run before deletion; when this service is accessed via a
   * controller, the bill run's status will already have been validated to ensure the bill run is editable.
   *
   * @param {@module:BillRunModel} billRun The bill run to be deleted.
   */
  static async go (billRun) {
    await this._setDeletingStatus(billRun)

    this._deleteBillRun(billRun)
  }

  static async _setDeletingStatus (billRun) {
    await billRun.$query()
      .patch({ status: 'deleting' })
  }

  static async _deleteBillRun (billRun) {
    await BillRunModel
      .query()
      .deleteById(billRun.id)
  }
}

module.exports = DeleteBillRunService
