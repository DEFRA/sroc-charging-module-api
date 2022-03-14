'use strict'

/**
 * @module TaskRunner
 */

const TaskNotifierLib = require('../lib/task_notifier.lib.js')

const CustomerFilesTask = require('./customer_files.task.js')
const DataExportTask = require('./data_export.task.js')

/**
 * Use to run any one of our 'tasks'
 *
 * It manages instantiating the notifier they'll use for logging progress and sending errors to Errbit then exiting
 * once the work is complete.
 *
 * ## Usage
 *
 * As new tasks are added there is a process that must be followed to implement them properly. The first 2 steps are no
 * different to what we do when adding services, translators etc.
 *
 * - add your new task to `app/tasks/` as a standard JS class using the 'service' pattern we have adopted
 * - add a reference to it in `app/tasks/index.js`
 *
 * The next steps are specific to tasks
 *
 * - add a reference to it in this file
 * - update the switch statement in `_determineTaskClass()` to handle your new task class
 * - add an entry to package.json, for example, `"my-new-task": "node app/tasks/index.js MyNewTask"` ensuring you
 * include the arg which is your tasks's class name
 */
class TaskRunner {
  /**
   * Execute the task runner for the task identified by the `className`
   *
   * @param {String} className Name of the task (class name) to be run
   */
  static async go (className) {
    const notifier = this._notifier()

    const taskClass = this._determineTaskClass(className.trim().toLowerCase())

    await taskClass.go(notifier)
    await notifier.flush()

    process.exit()
  }

  static _determineTaskClass (className) {
    const taskClasses = {
      customerfilestask: CustomerFilesTask,
      dataexporttask: DataExportTask
    }

    if (!taskClasses[className]) {
      throw new Error(`Unknown class name '${className}' passed to task runner`)
    }

    return taskClasses[className]
  }

  static _notifier () {
    return new TaskNotifierLib()
  }
}

module.exports = TaskRunner
