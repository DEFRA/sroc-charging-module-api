/**
 * @module CustomerFilesTask
 */

import RegimeModel from '../models/regime.model.js'
import SendCustomerFileService from '../services/send_customer_file.service.js'
import StaticLookupLib from '../lib/static_lookup.lib.js'

export default class CustomerFilesTask {
  /**
   * Check and if required generate a 'customer file' for each regime in the system
   *
   * Intended to be called as a scheduled task from Jenkins using a package.json script and via `TaskRunner`. It gets
   * all regimes in the service and then calls `SendCustomerFileService` for each one.
   *
   * @param {@module:BaseNotifierLib} notifier Instance of a `Notifier` class. Expected to be an instance of
   * `TaskNotifierLib` but anything that implements `BaseNotifierLib` is supported.
   */
  static async go (notifier) {
    notifier.omg('Starting sending customer files task')

    const regimes = await this._regimes()
    const regions = StaticLookupLib.regions

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
