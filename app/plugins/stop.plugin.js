'use strict'

/**
 * Handle `SIGTERM` and `SIGINT` calls to the app
 *
 * `SIGINT` is the signal sent when a user presses 'CTRL+C' in the terminal. `SIGTERM` is the generic version often sent
 * by a host or managing system process.
 *
 * They are both requests to an app to terminate. Without this plugin the app would immediately stop when the signal
 * is received. Our issue is this means any in-flight requests will be dropped and not allowed to complete and return a
 * response.
 *
 * We want to avoid dropping any existing requests whilst also not accepting new ones. By handling the terminate
 * signals we can call {@link https://hapi.dev/api/?v=20.0.3#-await-serverstopoptions|Hapi's server.stop()} which does
 * exactly that.
 *
 * It rejects new requests whilst allowing a period of time for existing ones to complete.
 *
 * *Based on* {@link https://github.com/visualjeff/hapi-graceful-shutdown-plugin}
 *
 * @see {@link https://www.gnu.org/software/libc/manual/html_node/Termination-Signals.html|Termination Signals} for further details about `SIGTERM` and `SIGINT`.
 *
 * @module StopPlugin
 */

const StopPlugin = {
  name: 'stop',
  register: (server, _options) => {
    // The timeout is set to 25 seconds (it has to be passed to Hapi in milliseconds) based on AWS ECS. When it sends a
    // stop request it allows an container 30 seconds before it sends a `SIGKILL`
    const options = {
      timeout: 25 * 1000
    }

    const stop = async () => {
      try {
        // If there are no in-flight requests Hapi will immediately stop. If there are they get 25 seconds to finish
        // before Hapi terminates them
        await server.stop(options)

        // Log we're shut down using the same log format as the rest of our log output
        server.logger.info('Thats all folks!')
        process.exit(0)
      } catch (err) {
        // Ensure we exit with a non-zero code so it can be picked up by whatever requested the termination that
        // something went wrong
        process.exit(1)
      }
    }

    if (process.env.NODE_ENV !== 'test') {
      process.on('SIGTERM', stop)
      process.on('SIGINT', stop)
    }
  }
}

module.exports = StopPlugin
