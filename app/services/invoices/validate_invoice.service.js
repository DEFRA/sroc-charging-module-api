'use strict'

/**
 * @module ValidateInvoiceService
 */

const Boom = require('@hapi/boom')

class ValidateInvoiceService {
  /**
  * Validates that an invoice is linked to the specified bill run and throws an error if the invoice is not linked.
  *
  * Note that this cannot be done as part of the "request invoice" plugin as the specified invoice is not linked to the
  * specified bill run when rebilling.
  *
  * Intended for use in the `view` and `delete` invoice endpoints.
  *
  * @param {string} billRun The bill run the invoice should link to
  * @param {string} invoice The invoice to validate
  */
  static async go (billRun, invoice) {
    // Simply call the validation method. It will throw an error if any issue is found
    this._validate(billRun, invoice)
  }

  static _validate (billRun, invoice) {
    if (invoice.billRunId !== billRun.id) {
      throw Boom.badData(`Invoice ${invoice.id} is not linked to bill run ${billRun.id}.`)
    }
  }
}

module.exports = ValidateInvoiceService
