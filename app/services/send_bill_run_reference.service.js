'use strict'

/**
 * @module SendBillRunReferenceService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../models')
const NextFileReferenceService = require('./next_file_reference.service')
const NextTransactionReferenceService = require('./next_transaction_reference.service')

class SendBillRunReferenceService {
  /**
   * Prepare a 'bill run' to be ready for billing by generating transaction references for its billable invoices and
   * generating an export file reference for it
   *
   * Before we export the invoices for a bill run to SSCL for billing we are required to generate a transaction
   * reference for each one.
   *
   * With that done we then need to generate a file reference for the export but only if there were invoices to be
   * billed. We don't want the files we send to SSCL to appear to have a gap in their reference so no one gets worried
   * something has gotten lost or missed.
   *
   * Either way, the bill run status is updated to 'pending' to flag it ready to be exported.
   *
   * @param {@module RegimeModel} regime An instance of `RegimeModel` which matches the requested regime
   * @param {@module:BillRunModel} billRun The 'bill run' to send for billing
   */
  static async go (regime, billRun) {
    this._validate(billRun)

    // If we don't await here as well as in the _send() method the call to go() ends. In our tests we have found this
    // means any attempt to check the status has changed immediately after fails
    await this._send(regime, billRun)
  }

  static _validate (billRun) {
    if (!billRun.$approved()) {
      throw Boom.conflict(`Bill run ${billRun.id} does not have a status of 'approved'.`)
    }
  }

  static async _send (regime, billRun) {
    await BillRunModel.transaction(async trx => {
      const billableCount = await this._updateBillableInvoices(regime, billRun, trx)

      // We only generate a file reference for the bill run if there was 1 or more billable invoices. This avoids gaps
      // in the file references and concern about whether something got lost in transit
      const fileReference = billableCount ? await NextFileReferenceService.go(regime, billRun.region, trx) : null

      await BillRunModel.query(trx)
        .findById(billRun.id)
        .patch({
          status: 'pending',
          fileReference
        })
    })
  }

  static async _updateBillableInvoices (regime, billRun, trx) {
    const billableInvoices = await this._billableInvoices(billRun)

    for (let i = 0; i < billableInvoices.length; i++) {
      const invoice = billableInvoices[i]
      const reference = await NextTransactionReferenceService.go(
        regime.id,
        billRun.region,
        invoice.$transactionType(),
        trx
      )
      await invoice.$query(trx).patch({ transactionReference: reference })
    }

    return billableInvoices.length
  }

  static _billableInvoices (billRun) {
    return billRun.$relatedQuery('invoices').modify('billable')
  }
}

module.exports = SendBillRunReferenceService
