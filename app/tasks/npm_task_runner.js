'use strict'

/**
 * This script is intended to be called from `package.json` when defining tasks to be run via an `npm start` command. It
 * accepts the name of a task (defined below) and will pass that task to TaskRunner to be executed.
 */

/**
 * Note that we disable the no-unused-vars linting rule as these constants are not used within this file; they are
 * instead used when calling it from `npm start`
 */

/* eslint-disable no-unused-vars */
const CustomerFilesTask = require('./customer_files.task.js')
const DataExportTask = require('./data_export.task.js')
/* eslint-enable no-unused-vars */

const TaskRunner = require('./task_runner.js')

TaskRunner.go(process.argv[2])
