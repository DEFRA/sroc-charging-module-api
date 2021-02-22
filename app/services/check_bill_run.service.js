'use strict'

/**
 * @module CheckBillRunService
 */

class CheckBillRunService {
  static async go (path) {
    return this._billRunRelated(path)
  }

  static _billRunRelated (path) {
    const billRunRegex = new RegExp(/\/bill-runs/i)

    return billRunRegex.test(path)
  }
}

module.exports = CheckBillRunService
