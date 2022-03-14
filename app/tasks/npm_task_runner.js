'use strict'

/**
 * This script is intended to be called from `package.json` when defining tasks to be run via an `npm start` command. It
 * accepts the name of a task (defined below) and will pass that task to TaskRunner to be executed.
 */

const CustomerFilesTask = require('./customer_files.task.js')
const DataExportTask = require('./data_export.task.js')
const TaskRunner = require('./task_runner.js')

TaskRunner.go(process.argv[2])
