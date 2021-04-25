'use strict'

const CustomerFilesTask = require('./customer_files.task')
const TaskRunner = require('./task_runner')

if (require.main === module) {
  TaskRunner.go(process.argv[2])
}

module.exports = {
  CustomerFilesTask,
  TaskRunner
}
