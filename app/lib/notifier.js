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
   * @param {Object} logger An instance of {@link https://github.com/pinojs/pino|pino}, a Node JSON logger
   * which the {@link https://github.com/pinojs/hapi-pino|hapi-pino} plugin adds to Hapi
   * @param {Object} notifier An instance of the {@link https://github.com/airbrake/airbrake-js|airbrake-js} `notify()`
   * method which our 'AirbrakePlugin` adds to Hapi
   */
  constructor (logger, notifier) {
    this._logger = logger
    this._notifier = notifier
  }

  /**
   * Use to add a message to the log
   *
   * The message will be added as an `INFO` level log message.
   *
   * @param {string} message Message to add to the log
   */
  omg (message) {
    this._logger.info(message)
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
   * @param {string} message Message to add to the log
   * @param {Object} data Any params or values, for example, a bill run ID to be included with the log message and sent
   * with the notification to Errbit
   */
  omfg (message, data = {}) {
    this._logger.error({ message, data })
    this._notifier(message, data)
  }
}

module.exports = Notifier
