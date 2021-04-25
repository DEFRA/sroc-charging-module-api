'use strict'

/**
 * @module CustomerFilesTask
 */

const { StaticLookup } = require('../lib')
const { RegimeModel } = require('../models')
const { SendCustomerFileService } = require('../services')

class CustomerFilesTask {
  static async go (notifier) {
    notifier.omg('Starting sending customer files task')

    const regimes = await this._regimes()
    const regions = StaticLookup.regions

    for (const regime of regimes) {
      await SendCustomerFileService.go(regime, regions, notifier)
    }

    notifier.omg('Finished sending customer files task')
  }

  static _regimes () {
    return RegimeModel
      .query()
  }
}

module.exports = CustomerFilesTask
