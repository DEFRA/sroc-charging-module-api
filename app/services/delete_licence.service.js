'use strict'

/**
 * @module DeleteLicenceService
 */

const { LicenceModel } = require('../models')

class DeleteLicenceService {
  /**
   * Deletes a licence along with its transactions. Intended to be run as a background task by a controller, ie. called
   * without an await. Note that the licence will _not_ be validated to ensure it is linked to the bill run; it is
   * expected that this will be done from the calling controller so that it can present the appropriate error to the
   * user immediately.
   *
   * @param {module:LicenceModel} licence The licence to be deleted.
   * @param {@module:RequestNotifierLib} notifier Instance of `RequestNotifierLib` class. We use it to log errors rather
   * than throwing them as this service is intended to run in the background.
   */
  static async go (licence, notifier) {
    try {
      await LicenceModel.transaction(async trx => {
        // We only need to delete the licence as it will cascade down to the transaction level.
        await LicenceModel
          .query(trx)
          .deleteById(licence.id)
      })
    } catch (error) {
      notifier.omfg('Error deleting licence', { id: licence.id, error })
    }
  }
}

module.exports = DeleteLicenceService
