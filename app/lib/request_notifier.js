'use strict'

/**
 * @module Notifier
 */

/**
 * Our combined logging and Airbrake (Errbit) notification manager.
 *
 * This is used in conjunction with the `NotifierPlugin` to make both logging via
 * {@link https://github.com/pinojs/pino|pino} and sending notifications to Errbit via
 * {@link https://github.com/airbrake/airbrake-js|airbrake-js} available to our controllers and their underlying
 * services.
 *
 * > ***So, `omg()` and `omfg()`. What's that all about!?***
 * >
 * > This is a very 'serious' project dealing with very dry finance and regulation rules. We love what we do but having
 * > the opportunity to use `omg('The bill run looks fantastic!')` in our work day can only help us smile more!
 */
class Notifier {
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
    this._id = id
    this._logger = logger
    this._notifier = notifier
  }

  /**
   * Use to add a message to the log
   *
   * The message will be added as an `INFO` level log message.
   *
   * @param {string} message Message to add to the log (INFO)
   * @param {Object} data Any params or values, for example, a bill run ID to be included with the log message
   */
  omg (message, data = {}) {
    this._logger.info(this._formatLogPacket(message, data))
  }

  /**
   * Use to add an 'error' message to the log and send a notification to Errbit
   *
   * Intended to be used when we want to record an error both in the logs and in Errbit.
   *
   * ## Notifications to Errbit
   *
   * Other than making errors more visible and accessible, the main benefit of Errbit is its ability to group instances
   * of the same error. But it can only do this if the 'error signature' is consistent. It is important that what we
   * send has a consistent 'message'. We can send whatever we like in the data as this is not used to generate the
   * signature.
   *
   * So, you should avoid
   *
   * ```
   * notifier.omfg(`Bill run id ${billRun.id} failed to generate.`)
   * ```
   *
   * Instead use
   *
   * ```
   * notifier.omfg('Bill run failed to generate.', { id: billRun.id })
   * ```
   *
   * @param {string} message Message to add to the log (ERROR)
   * @param {Object} data Any params or values, for example, a bill run ID to be included with the log message and sent
   * with the notification to Errbit
   */
  omfg (message, data = {}) {
    this._logger.error(this._formatLogPacket(message, data))
    this._notifier(message, { id: this._id, data })
  }

  /**
   * Used to format the 'packet' of information sent to the logger
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
}

module.exports = Notifier
