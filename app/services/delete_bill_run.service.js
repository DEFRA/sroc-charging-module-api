'use strict'

/**
 * @module DeleteInvoiceService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../models')

class DeleteBillRunService {
  /**
   * Deletes a bill run along with its invoices, licences and transactions.
   *
   * @param {@module:BillRunModel} billRun The bill run to be deleted.
   */
  static async go (billRun) {
    this._validate(billRun)

    await BillRunModel
      .query()
      .deleteById(billRun.id)
  }

  static _validate (billRun) {
    if (billRun.$billed()) {
      throw Boom.conflict(`Bill run ${billRun.id} has a status of 'billed'.`)
    }
  }
}

module.exports = DeleteBillRunService
