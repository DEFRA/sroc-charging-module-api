'use strict'

/**
 * @module StaticLookupLib
 */

/**
 * Class object containing static data that is relevant across multiple services
 */
class StaticLookupLib {
  static get regions () {
    return ['A', 'B', 'E', 'N', 'S', 'T', 'W', 'Y']
  }
}

module.exports = StaticLookupLib
