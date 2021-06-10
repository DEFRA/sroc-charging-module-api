'use strict'

/**
 * @module BaseNotifierLib
 */

const { Notifier } = require('@airbrake/node')
const Pino = require('pino')

const { AirbrakeConfig } = require('../../config')

/**
 * Based class for combined logging and Airbrake (Errbit) notification managers
 *
 * This is used to make both logging via {@link https://github.com/pinojs/pino|pino} and sending notifications to
 * Errbit via {@link https://github.com/airbrake/airbrake-js|airbrake-js} available in the service.
 *
 * Most functionality is maintained in this `BaseNotifierLib` with the expectation that classes will extend it for their
 * particular scenario, for example, the `RequestNotifier` handles including the request ID in its output.
 *
 * > ***So, `omg()` and `omfg()`. What's that all about!?***
 * >
 * > This is a very 'serious' project dealing with very dry finance and regulation rules. We love what we do but having
 * > the opportunity to use `omg('The bill run looks fantastic!')` in our work day can only help us smile more!
 *
 * @param {Object} [logger] An instance of {@link https://github.com/pinojs/pino|pino}. If 'null' the class will
 * create a new instance instead.
 * @param {Object} [notifier] An instance of {@link https://github.com/airbrake/airbrake-js|airbrake-js} `Notifier`
 * which our 'AirbrakePlugin` adds to Hapi. If 'null' the class will create a new instance instead.
 */
class BaseNotifierLib {
  constructor (logger = null, notifier = null) {
    this._logger = this._setLogger(logger)
    this._notifier = this._setNotifier(notifier)
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

    this._notifier.notify(this._formatNotifyPacket(message, data))
      .then(notice => {
        if (!notice.id) {
          this._logger.error(
            this._formatLogPacket(`${this.constructor.name} - Airbrake failed`, { error: notice.error })
          )
        }
      })
      .catch(err => {
        this._logger.error(this._formatLogPacket(`${this.constructor.name} - Airbrake errored`, { error: err }))
      })
  }

  /**
   * Flush any outstanding Airbrake notifications
   *
   * It's not immediately obvious but Airbrake notifications are actually queued and sent in the background. This is
   * fine when the API is running. We expect it to always be running so there is plenty of time for the notifications
   * to be sent.
   *
   * In the case of tasks though, they are one time calls that expect to process.exit as soon as the work is done. Our
   * testing highlighted that should an error occur and we don't `flush()` Airbrake's queue, we never see them in
   * Errbit. So, we expose Airbrake's `flush()` using this method which notifiers that extend the base can make use of.
   */
  async flush () {
    await this._notifier.flush()
  }

  /**
   * Used to format the 'packet' of information sent to the log
   *
   * **Must be overridden by extending class**
   */
  _formatLogPacket (_message, _data) {
    throw new Error("Extending class must implement '_formatLogPacket()'")
  }

  /**
   * Used to format the 'packet' of information sent to Errbit
   *
   * **Must be overridden by extending class**
   */
  _formatNotifyPacket (_message, _data) {
    throw new Error("Extending class must implement '_formatNotifyPacket()'")
  }

  /**
   * Return the 'logger' instance
   *
   * Returns an instance of {@link https://github.com/pinojs/pino|Pino} the logger our dependency Hapi-pino brings in.
   * We can then call `info()` and `error()` on it in order to create our log entries.
   *
   * @param {Object} [logger] An instance of {@link https://github.com/pinojs/pino|pino}. If 'null' the method will
   * create a new instance.
   */
  _setLogger (logger) {
    if (logger) {
      return logger
    }

    return Pino()
  }

  /**
   * Returns the 'notifier' instance
   *
   * Returns an instance of {@link https://github.com/airbrake/airbrake-js|airbrake-js} `Notifier` which when called
   * with `notify()` will record errors in our Errbit instance.
   *
   * @param {Object} [notifier] An instance of the {@link https://github.com/airbrake/airbrake-js|airbrake-js}
   * `Notifier`. If 'null' the class will create a new instance instead.
   */
  _setNotifier (notifier) {
    if (notifier) {
      return notifier
    }

    return new Notifier({
      host: AirbrakeConfig.host,
      projectId: AirbrakeConfig.projectId,
      projectKey: AirbrakeConfig.projectKey,
      environment: AirbrakeConfig.environment,
      performanceStats: false
    })
  }
}

module.exports = BaseNotifierLib
