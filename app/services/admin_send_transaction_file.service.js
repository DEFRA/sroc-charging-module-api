'use strict'

/**
 * @module AdminSendTransactionFileService
 */

const SendTransactionFileService = require('./send_transaction_file.service')

// We require BoomNotifierLib this way as the usual way of destructuring it results in a circular dependency error
const BoomNotifierLib = require('../lib/boom_notifier.lib')

const Boom = require('@hapi/boom')

class AdminSendTransactionFileService {
  /**
   * Service which allows SendTransactionFileService to be run asyncronously, throwing an error if validation fails or
   * if an error occurs during the sending of the transaction file.
   *
   * It is intended to be called by an admin endpoint as an admin user will want to see any errors which occur without
   * having to check the logs, whereas the non-admin use case is that the transaction file is sent syncronously as a
   * background task.
   *
   * @param {module:RegimeModel} regime The regime that the bill run belongs to.
   * @param {module:BillRun} billRun The bill run we want to send the transaction file for.
   */
  static async go (regime, billRun) {
    this._validate(billRun)

    await SendTransactionFileService.go(regime, billRun, new BoomNotifierLib())
  }

  static _validate (billRun) {
    if (!billRun.$pending()) {
      throw Boom.conflict(`Bill run ${billRun.id} does not have a status of 'pending'.`)
    }
  }
}

module.exports = AdminSendTransactionFileService
