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
   * @param {@module:Notifier} notifier Instance of `Notifier` class. We use it to log errors rather than throwing them
   * as this service is intended to run in the background.
   *
   */
  static async go (billRun, notifier) {
    try {
      await this._setDeletingStatus(billRun)

      await this._deleteBillRun(billRun)
    } catch (error) {
      notifier.omfg('Error deleting bill run', { id: billRun.id, error })
    }
  }

  static _setDeletingStatus (billRun) {
    return billRun.$query()
      .patch({ status: 'deleting' })
  }

  static _deleteBillRun (billRun) {
    return BillRunModel
      .query()
      .deleteById(billRun.id)
  }
}

module.exports = DeleteBillRunService
