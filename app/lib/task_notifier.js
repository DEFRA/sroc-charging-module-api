'use strict'

/**
 * @module TaskNotifier
 */

const BaseNotifier = require('./base_notifier')

/**
 * A combined logging and Airbrake (Errbit) notification manager for tasks that take place outside of a
 * {@link https://hapi.dev/api/?v=20.1.2#request|Hapi request}
 *
 * This was initially created to be used with the `npm run customer-files` task but can be used for anywhere that
 * notifications are needed and you don't have a request ID.
 */
class TaskNotifier extends BaseNotifier {
  _formatLogPacket (message, data) {
    return {
      message,
      ...data
    }
  }

  _formatNotifyPacket (message, data) {
    return {
      message,
      session: data
    }
  }
}

module.exports = TaskNotifier
