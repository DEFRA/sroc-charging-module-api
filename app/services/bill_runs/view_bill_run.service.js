'use strict'

/**
 * @module ViewBillRunService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../../models')
const { ViewBillRunPresenter } = require('../../presenters')

/**
 * Locates a bill run and returns the available details
 */
class ViewBillRunService {
  /**
   * Fetches a bill run based on its id and returns the data needed by the View Bill Run endpoint
   *
   * @param {string} billRunId The id of the bill run we want to view
   *
   * @returns {Object} The requested bill run data
   */
  static async go (billRunId) {
    const billRun = await this._billRun(billRunId)

    return this._billRunResponse(billRun)
  }

  static async _billRun (billRunId) {
    // Not all fields are returned in the response but they are needed to calculate things like `netTotal`. Double
    // check before thinking of removing them!
    const billRun = await BillRunModel.query()
      .findById(billRunId)
      .select(
        'id',
        'region',
        'status',
        'billRunNumber',
        'subjectToMinimumChargeCount',
        'subjectToMinimumChargeCreditValue',
        'subjectToMinimumChargeDebitValue',
        'debitLineValue',
        'creditLineValue',
        'creditNoteCount',
        'creditNoteValue',
        'invoiceCount',
        'invoiceValue',
        'fileReference'
      )
      .withGraphFetched('invoices.licences')
      .modifyGraph('invoices', (builder) => {
        builder.select(
          'id',
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
          'transactionReference',
          'rebilledType',
          'rebilledInvoiceId'
        )
      })
      .modifyGraph('invoices.licences', (builder) => {
        builder.select(
          'id',
          'licenceNumber'
        )
      })

    // netTotal is not persisted for invoices or bill runs so we first call _addNetTotalToInvoices to add it to each
    // invoice. We then pass these invoices to _calculateBillRunNetTotal which uses the newly-added net totals to give
    // us the overall bill run net total.
    if (billRun) {
      const invoices = this._addNetTotalToInvoices(billRun.invoices)
      const netTotal = this._calculateBillRunNetTotal(invoices)

      return {
        ...billRun,
        netTotal,
        invoices
      }
    }

    throw Boom.notFound(`Bill run ${billRunId} is unknown.`)
  }

  static _billRunResponse (billRun) {
    const presenter = new ViewBillRunPresenter(billRun)

    return presenter.go()
  }

  /**
   * Take an array of invoices and add invoice.$netTotal() to each one then return the resulting array
   */
  static _addNetTotalToInvoices (invoices) {
    return invoices.map(invoice => {
      return {
        ...invoice,
        netTotal: invoice.$netTotal()
      }
    })
  }

  /**
   * Take an array of invoices and calculate their net total, excluding any deminimis invoices
   */
  static _calculateBillRunNetTotal (invoices) {
    return invoices.reduce((acc, invoice) => {
      const invoiceValue = invoice.deminimisInvoice ? 0 : invoice.netTotal
      return acc + invoiceValue
    }, 0)
  }
}

module.exports = ViewBillRunService
