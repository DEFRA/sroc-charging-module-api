'use strict'

class Notifier {
  constructor (logger, notifier) {
    this._logger = logger
    this._notifier = notifier
  }

  omg (message) {
    this._logger.info(message)
  }

  omfg (message, data = {}) {
    this._logger.error({ message, data })
    this._notifier(message, data)
  }
}

module.exports = Notifier
