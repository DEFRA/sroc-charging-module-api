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
      // Deminimis is no longer part of sroc so we disable it by setting a 0 deminimis limit
      sroc: 0
    }
  }
}

module.exports = StaticLookupLib
