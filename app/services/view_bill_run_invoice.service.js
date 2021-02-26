'use strict'

/**
 * @module ViewBillRunInvoiceService
 */

const { InvoiceModel } = require('../models')
const { ViewInvoicePresenter } = require('../presenters')
const FetchAndValidateBillRunInvoiceService = require('./fetch_and_validate_bill_run_invoice.service')

class ViewBillRunInvoiceService {
  /**
   * Locates and validates an invoice for the specificed bill run and returns the data needed by the View Invoice
   * endpoint
   *
   * @param {string} billRunId The id of the bill run the invoice is linked to
   * @param {string} invoiceId The id of the invoice we are trying to view
   *
   * @returns {Object} The requested invoice data
   */
  static async go (billRunId, invoiceId) {
    let invoice = await FetchAndValidateBillRunInvoiceService.go(billRunId, invoiceId)

    invoice = await this._invoiceResponseData(invoice.id)

    return this._response(invoice)
  }

  static async _invoiceResponseData (invoiceId) {
    const invoice = await InvoiceModel.query()
      .findById(invoiceId)
      .select(
        'id',
        'billRunId',
        'customerReference',
        'financialYear',
        'creditLineCount',
        'creditLineValue',
        'debitLineCount',
        'debitLineValue',
        'zeroLineCount',
        'deminimisInvoice',
        'zeroValueInvoice',
        'minimumChargeInvoice',
        'transactionReference'
      )
      .withGraphFetched('licences.transactions')
      .modifyGraph('licences', (builder) => {
        builder.select(
          'id',
          'licenceNumber',
          'creditLineCount',
          'creditLineValue',
          'debitLineCount',
          'debitLineValue',
          'zeroLineCount',
          'subjectToMinimumChargeCount'
        )
      })
      .modifyGraph('licences.transactions', (builder) => {
        builder.select(
          'id',
          'clientId',
          'chargeValue',
          'chargeCredit',
          'status',
          'subjectToMinimumCharge',
          'minimumChargeAdjustment',
          'lineDescription',
          'chargePeriodStart',
          'chargePeriodEnd',
          'regimeValue17',
          'chargeCalculation'
        )
      })

    return {
      ...invoice,
      netTotal: invoice.$netTotal(),
      licences: this._addNetTotalToLicence(invoice.licences)
    }
  }

  static _response (invoice) {
    const presenter = new ViewInvoicePresenter(invoice)

    return presenter.go()
  }

  /**
   * Take an array of licences and adds $netTotal() to each one then returns the resulting array
   */
  static _addNetTotalToLicence (licences) {
    return licences.map(licence => {
      return {
        ...licence,
        netTotal: licence.$netTotal()
      }
    })
  }
}

module.exports = ViewBillRunInvoiceService
