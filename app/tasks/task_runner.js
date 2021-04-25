'use strict'

/**
 * @module TaskRunner
 */

const CustomerFilesTask = require('./customer_files.task')

class TaskRunner {
  static async go (className) {
    const notifier = this._notifier()

    const taskClass = this._determineTaskClass(className.trim().toLowerCase())

    await taskClass.go(notifier)
    await notifier.flush()

    process.exit()
  }

  static _determineTaskClass (className) {
    switch (className) {
      case 'customerfilestask':
        return CustomerFilesTask
      default:
        throw new Error(`Unknown class name '${className}' passed to task runner`)
    }
  }

  static _notifier () {
    return {
      omg: (message, data = {}) => {
        console.log(message, data)
      },
      omfg: (message, data = {}) => {
        console.error(message, data)
      },
      flush: async () => {
        console.log('Flushed!')
      }
    }
  }
}

module.exports = TaskRunner
