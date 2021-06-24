/**
 * @module ApproveBillRunService
 */

const Boom = require('@hapi/boom')

class ApproveBillRunService {
  static async go (billRun) {
    this._validate(billRun)

    // If we don't await here as well as in the _approve() method the call to go() ends. In our tests we have found this
    // means any attempt to check the status has changed immediately after fails
    await this._approve(billRun)
  }

  static _validate (billRun) {
    if (!billRun.$generated()) {
      throw Boom.conflict(`Bill run ${billRun.id} does not have a status of 'generated'.`)
    }
  }

  static async _approve (billRun) {
    await billRun.$query()
      .patch({ status: 'approved' })
  }
}

module.exports = ApproveBillRunService
