'use strict'

const { LicenceModel } = require('../../../app/models')

const NewInvoiceHelper = require('./new_invoice.helper')

class NewLicenceHelper {
  /**
   * Create a licence
   *
   * @param {module:InvoiceModel} [invoice] Invoice the licence is to be created on. If not specified then a new invoice
   *  will be created.
   * @param {object} [overrides] JSON object of values which will override the ones the helper defaults to.
   *
   * @returns {module:LicenceModel} The newly created instance of `LicenceModel`.
   */
  static async add (invoice, overrides) {
    if (!invoice) {
      invoice = await NewInvoiceHelper.add()
    }

    const licenceValues = {
      ...this._defaultLicence(),
      ...overrides
    }

    const licence = await LicenceModel.query()
      .insert({
        invoiceId: invoice.id,
        billRunId: invoice.billRunId,
        ...licenceValues
      })
      .returning('*')

    const updatePatch = this._updatePatch(licence)
    await NewInvoiceHelper.update(invoice, updatePatch)

    return licence
  }

  static _defaultLicence () {
    return {
      licenceNumber: 'LICENCE_NUMBER',
      creditLineCount: 0,
      creditLineValue: 0,
      debitLineCount: 0,
      debitLineValue: 0,
      zeroLineCount: 0,
      subjectToMinimumChargeCount: 0,
      subjectToMinimumChargeCreditValue: 0,
      subjectToMinimumChargeDebitValue: 0
    }
  }

  static _updatePatch (licence) {
    return {
      creditLineCount: licence.creditLineCount,
      creditLineValue: licence.creditLineValue,
      debitLineCount: licence.debitLineCount,
      debitLineValue: licence.debitLineValue,
      zeroLineCount: licence.zeroLineCount,
      subjectToMinimumChargeCount: licence.subjectToMinimumChargeCount,
      subjectToMinimumChargeCreditValue: licence.subjectToMinimumChargeCreditValue,
      subjectToMinimumChargeDebitValue: licence.subjectToMinimumChargeDebitValue
    }
  }

  /**
   * Updates a licence
   *
   * @param {module:LicenceModel} licence The licence to be updated.
   * @param {object} updates JSON object of values to be updated. Each value in the object will be added to the existing
   *  value in the licence if it is a number; if it isn't a number then the existing value will be replaced.
   *
   * @returns {module:LicenceModel} The newly updated instance of `LicenceModel`.
   */
  static async update (licence, updates = {}) {
    const patch = {}

    for (const key in updates) {
      // If the value is a number then we add it to the existing number; otherwise we replace the existing value
      if (typeof updates[key] === 'number') {
        patch[key] = licence[key] + updates[key]
      } else {
        patch[key] = updates[key]
      }
    }

    return licence.$query()
      .patchAndFetch(patch)
  }
}

module.exports = NewLicenceHelper
