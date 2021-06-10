'use strict'

/**
 * @module RequestNotifierLib
 */

const BaseNotifierLib = require('./base_notifier.lib')

/**
 * A combined logging and Airbrake (Errbit) notification manager for actions that take place within a
 * {@link https://hapi.dev/api/?v=20.1.2#request|Hapi request}
 *
 * This is used in conjunction with the `RequestNotifierPlugin` to make both logging via
 * {@link https://github.com/pinojs/pino|pino} and sending notifications to Errbit via
 * {@link https://github.com/airbrake/airbrake-js|airbrake-js} available to our controllers and their underlying
 * services.
 *
 * This extends the `BaseNotifierLib` to also ensure the request ID is included in all output. We can then identify all
 * related log entries and Errbit notifications by using the ID.
 */
class RequestNotifierLib extends BaseNotifierLib {
  /**
   * Instantiate a new instance
   *
   * @param {string} id The request ID taken from a {@link https://hapi.dev/api/?v=20.1.2#request|Hapi request}
   * instance. Used to link notifications to the requests that generated them
   * @param {Object} logger An instance of {@link https://github.com/pinojs/pino|pino}, a Node JSON logger
   * which the {@link https://github.com/pinojs/hapi-pino|hapi-pino} plugin adds to Hapi
   * @param {Object} notifier An instance of the {@link https://github.com/airbrake/airbrake-js|airbrake-js} `notify()`
   * method which our 'AirbrakePlugin` adds to Hapi
   */
  constructor (id, logger, notifier) {
    super(logger, notifier)
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

module.exports = RequestNotifierLib
