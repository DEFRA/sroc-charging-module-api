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

  static get rulesets () {
    return ['presroc', 'sroc']
  }

  static get deminimisLimits () {
    return {
      presroc: 500,
      sroc: 1000
    }
  }
}

module.exports = StaticLookupLib
