'use strict'

const CustomerFilesTask = require('./customer_files.task')
const TaskRunner = require('./task_runner')

// This determines if the module has been run directly, for example, as a script entry in `package.json` or just
// used in a `require()` call. If run directly we execute the `TaskRunner`.
if (require.main === module) {
  TaskRunner.go(process.argv[2])
}

module.exports = {
  CustomerFilesTask,
  TaskRunner
}
