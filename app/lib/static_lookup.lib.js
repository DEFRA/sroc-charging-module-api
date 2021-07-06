/**
 * @module StaticLookupLib
 */

/**
 * Class object containing static data that is relevant across multiple services
 */
export default class StaticLookupLib {
  static get regions () {
    return ['A', 'B', 'E', 'N', 'S', 'T', 'W', 'Y']
  }
}
