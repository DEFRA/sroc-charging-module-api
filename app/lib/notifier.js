'use strict'

class Notifier {
  #logger
  #notifier

  constructor (logger, notifier) {
    this.#logger = logger
    this.#notifier = notifier
  }

  omg (message) {
    this.#logger.info(message)
  }

  omfg (message, data = {}) {
    this.#logger.error({ message, data })
    this.#notifier(message, data)
  }
}

module.exports = Notifier
