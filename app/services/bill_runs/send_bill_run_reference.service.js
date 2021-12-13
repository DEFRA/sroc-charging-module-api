'use strict'

/**
 * @module SendBillRunReferenceService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../../models')
const NextTransactionFileReferenceService = require('../next_references/next_transaction_file_reference.service')
const NextTransactionReferenceService = require('../next_references/next_transaction_reference.service')

class SendBillRunReferenceService {
  /**
   * Prepare a 'bill run' to be ready for billing by generating transaction references for its billable invoices and
   * generating an export file reference for it.
   *
   * We start by setting the bill run status to `pending` to flag that the bill run is being updated.
   *
   * Before we export the invoices for a bill run to SSCL for billing we are required to generate a transaction
   * reference for each one.
   *
   * With that done we then need to generate a file reference for the export but only if there were invoices to be
   * billed. We don't want the files we send to SSCL to appear to have a gap in their reference so no one gets worried
   * something has gotten lost or missed.
   *
   * Either way, the bill run status is updated to `sending` to flag it ready to be exported.
   *
   * @param {@module RegimeModel} regime An instance of `RegimeModel` which matches the requested regime
   * @param {@module:BillRunModel} billRun The 'bill run' to send for billing
   *
   * @returns {@module:BillRunModel} the 'sent' bill run with an updated file reference (if applicable) and status
   */
  static async go (regime, billRun) {
    this._validate(billRun)

    // If we don't await here as well as in the _send() method the call to go() ends. In our tests we have found this
    // means any attempt to check the status has changed immediately after fails
    return this._send(regime, billRun)
  }

  static _validate (billRun) {
    if (!billRun.$approved()) {
      throw Boom.conflict(`Bill run ${billRun.id} does not have a status of 'approved'.`)
    }
  }

  static async _send (regime, billRun) {
    // We set the bill run status to `pending` to signify that the bill run info is being updated
    await billRun.$query()
      .patch({
        status: 'pending'
      })

    return BillRunModel.transaction(async trx => {
      const billableCount = await this._updateBillableInvoices(regime, billRun, trx)

      // We only generate a file reference for the bill run if there was 1 or more billable invoices. This avoids gaps
      // in the file references and concern about whether something got lost in transit
      const fileReference = billableCount ? await NextTransactionFileReferenceService.go(regime, billRun.region, trx) : null

      // We set the status to `sending` to show that we've finished updating the bill run info and it's now being sent
      return BillRunModel.query(trx)
        .findById(billRun.id)
        .patch({
          status: 'sending',
          fileReference
        })
        .returning('*')
    })
  }

  static async _updateBillableInvoices (regime, billRun, trx) {
    const billableInvoices = await this._billableInvoices(billRun)

    let updatedInvoices = 0

    for (const invoice of billableInvoices) {
      const reference = await NextTransactionReferenceService.go(
        regime.id,
        billRun.region,
        invoice.$transactionType(),
        trx
      )
      updatedInvoices += await invoice.$query(trx).patch({ transactionReference: reference })
    }

    return updatedInvoices
  }

  static _billableInvoices (billRun) {
    return billRun.$relatedQuery('invoices').modify('billable')
  }
}

module.exports = SendBillRunReferenceService
