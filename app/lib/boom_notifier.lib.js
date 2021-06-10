'use strict'

/**
 * @module BoomNotifierLib
 */

const RequestNotifierLib = require('./request_notifier.lib')

const Boom = require('@hapi/boom')

/**
 * A combined logging and Airbrake (Errbit) notification manager which extends RequestNotifierLib to also throw a Boom
 * `400` error if the .omfg method is called.
 *
 * The use case for RequestNotifierLib is to log errors which occur in syncronous "background" tasks -- ie. where a
 * controller calls a service then immediately returns a response while the service continues to run. Any errors thrown
 * within the background task are caught and logged using the notifier.
 *
 * The use case for BoomNotifierLib is for when we wish to run one of these background tasks asyncronously -- for
 * example, sending a bill run would normally be done in the background but we want the 'send bill run' admin endpoint
 * to run it in the foreground so any errors which occur are returned straight away so we don't need to dig through the
 * logs.
 *
 * We therefore create a notifier which inherits everything from RequestNotifierLib and uses super to extend the omfg
 * method so it throws an error after logging.
 */
class BoomNotifierLib extends RequestNotifierLib {
  omfg (message, data = {}) {
    super.omfg(message, data)
    throw Boom.badData(message, data)
  }
}

module.exports = BoomNotifierLib
