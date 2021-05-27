'use strict'

/**
 * @module ValidateBillRunLicenceService
 */

const Boom = require('@hapi/boom')

const { InvoiceModel } = require('../models')

class ValidateBillRunLicenceService {
  /**
  * Validates that a licence is linked to the specified bill run and is not part of a rebilling invoice. Intended for
  * use in the `delete` licence endpoint.
  *
  * @param {string} billRunId Id of the bill run the licence should link to
  * @param {@module:LicenceModel} licence An instance of the licence to be validated
  * @returns {Boolean} Returns `true` if validation suceeds; if validation fails then a `409` error will have been
  * thrown.
  */
  static async go (billRunId, licence) {
    const invoice = await this._invoice(licence.invoiceId)

    this._validate(billRunId, licence, invoice)

    return true
  }

  static _invoice (invoiceId) {
    return InvoiceModel.query().findById(invoiceId)
  }

  static _validate (billRunId, licence, invoice) {
    if (licence.billRunId !== billRunId) {
      throw Boom.conflict(`Licence ${licence.id} is not linked to bill run ${billRunId}.`)
    }

    if (!invoice.$originalInvoice()) {
      throw Boom.conflict(`Invoice ${invoice.id} was created as part of a rebilling request.`)
    }
  }
}

module.exports = ValidateBillRunLicenceService
