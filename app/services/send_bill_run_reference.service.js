'use strict'

/**
 * @module SendBillRunReferenceService
 */

const Boom = require('@hapi/boom')

const { BillRunModel } = require('../models')
const NextFileReferenceService = require('./next_file_reference.service')
const NextTransactionReferenceService = require('./next_transaction_reference.service')

class SendBillRunReferenceService {
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
      await this._updateBillableInvoices(regime, billRun, trx)

      const fileReference = await NextFileReferenceService.go(regime, billRun.region, trx)

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
  }

  static _billableInvoices (billRun) {
    return billRun.$relatedQuery('invoices').modify('billable')
  }
}

module.exports = SendBillRunReferenceService
