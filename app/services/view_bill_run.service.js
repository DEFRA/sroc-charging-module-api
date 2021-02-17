'use strict'

/**
 * @module ViewBillRunService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../models')
const { ViewBillRunPresenter } = require('../presenters')

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
    const billRun = await BillRunModel.query()
      .findById(billRunId)
      .select(
        'id',
        'region',
        'status',
        'billRunNumber',
        'creditCount',
        'creditValue',
        'debitCount',
        'debitValue',
        'zeroCount',
        'subjectToMinimumChargeCount',
        'subjectToMinimumChargeCreditValue',
        'subjectToMinimumChargeDebitValue',
        'creditNoteCount',
        'creditNoteValue',
        'invoiceCount',
        'invoiceValue'
      )
      .withGraphFetched('invoices.licences')
      .modifyGraph('invoices', (builder) => {
        builder.select(
          'id',
          'customerReference',
          'financialYear',
          'creditCount',
          'creditValue',
          'debitCount',
          'debitValue',
          'zeroCount',
          'deminimisInvoice',
          'zeroValueInvoice',
          'minimumChargeInvoice'
        )
      })
      .modifyGraph('invoices.licences', (builder) => {
        builder.select(
          'id',
          'licenceNumber'
        )
      })

    // The net total is not persisted in the db so we add in the result of the BillRunModel.$netTotal() method
    if (billRun) {
      return {
        ...billRun,
        netTotal: billRun.$netTotal(),
        invoices: this._addNetTotalToInvoices(billRun.invoices)
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
}

module.exports = ViewBillRunService
