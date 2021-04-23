'use strict'

/**
 * @module RequestNotifier
 */

const { BaseNotifier } = require('./base_notifier')

/**
 * Intended to be bound to the {@link https://hapi.dev/api/?v=20.1.2#request|Hapi request object}
 *
 * This extends the `BaseNotifier` to also ensure the request ID is included in all output. We can then identify all
 * related log entries and Errbit notifications by using the ID.
 */
class RequestNotifier extends BaseNotifier {
  /**
   * Instantiate a new instance
   *
   * @param {string} id The request ID taken from a {@link https://hapi.dev/api/?v=20.1.2#request|Hapi request}
   * instance. Used to link notifications to the requests that generated them
   */
  constructor (id) {
    super()
    this._id = id
  }

  /**
   * Used to format the 'packet' of information sent to the log
   *
   * We don't just want the log output to include the request ID. We want it to output it in the same structure as the
   * Hapi request is logged, for example
   *
   * ```
   * req: {
   *   "id": "1617655289640:533c1e381364:1671:kn526tbx:10000",
   *   ...
   * ```
   *
   * This means we can then locate all log entries for a specific request in AWS Cloudwatch by using
   * {@link https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html|Metric Filters}
   *
   * ```
   * { $.req.id = "1617655289640:533c1e381364:1671:kn526tbx:10000" }
   * ```
   */
  _formatLogPacket (message, data) {
    return {
      message,
      ...data,
      req: {
        id: this._id
      }
    }
  }

  /**
   * Used to format the 'packet' of information sent to Errbit
   *
   * This will format the packet so that Errbit displays the information correctly. It also adds the request ID so we
   * can tie it back to the original request that raised the notification
   *
   * This means we can then locate the request in the log entries in AWS Cloudwatch by using
   * {@link https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html|Metric Filters}
   *
   * ```
   * { $.req.id = "1617655289640:533c1e381364:1671:kn526tbx:10000" }
   * ```
   */
  _formatNotifyPacket (message, data) {
    return {
      message,
      session: {
        ...data,
        req: {
          id: this._id
        }
      }
    }
  }
}

module.exports = RequestNotifier
