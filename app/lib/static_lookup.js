'use strict'

/**
 * @module StaticLookup
 */

/**
 * Class object containing static data that is relevant across multiple services
 */
class StaticLookup {
  static get regions () {
    return ['A', 'B', 'E', 'N', 'S', 'T', 'W', 'Y']
  }
}

module.exports = StaticLookup
