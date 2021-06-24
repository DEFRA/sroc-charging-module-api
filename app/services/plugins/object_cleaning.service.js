/**
 * @module ObjectCleaningService
 */

const Sanitizer = require('sanitizer')

/**
 * Loop through an object's properties and 'clean' it.
 *
 * When a request payload comes in there are a number of things we want to do to its values
 *
 * - remove anything malicious
 * - remove anything empty
 * - remove any extraneous whitespace
 * - protect non-string values like booleans and numbers
 *
 * By doing this we protect our service and avoid sprinkling our business logic with guards and `trim()` etc. It can
 * remain simple and focused.
 *
 * For example, suppose the payload request was like this
 *
 * ```
 * {
 *   reference: '  BESESAME001  ',
 *   codes: ['AB1', ' BD2', '', '  ', 'CD3  '],
 *   summary: '',
 *   description: '<script>alert()</script>',
 *   preferences: [true, false, true],
 *   details: {
 *     active: false,
 *     orders: [
 *       {
 *         id: '123',
 *         pickers: [],
 *         orderDate: '2012-04-23T18:25:43.511Z',
 *         lines: [
 *           { pos: 1, picked: true, item: ' widget ' },
 *           { pos: 2, picked: false, item: ' widget ' }
 *         ]
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * It contains values with unnecessary whitespace, values that are only whitespace, and empty values. It even contains
 * some malicious script (a problem if you inadvertently passed it to a browser to render). We only want the endpoint to
 * see this.
 *
 * ```
 * {
 *   reference: 'BESESAME001',
 *   codes: ['AB1', 'BD2', 'CD3'],
 *   preferences: [true, false, true],
 *   details: {
 *     active: false,
 *     orders: [
 *       {
 *         id: '123',
 *         orderDate: '2012-04-23T18:25:43.511Z',
 *         lines: [
 *           { pos: 1, picked: true, item: 'widget' },
 *           { pos: 2, picked: false, item: 'widget' }
 *         ]
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * So we created this service which is used by the `PayLoadCleanerPlugin` to 'clean' incoming requests.
 *
 * * @module ObjectCleaningService
 */
class ObjectCleaningService {
  static go (obj) {
    return this._cleanObject(obj)
  }

  /**
   * Loop through an `Object` and clean each of its properties.
   *
   * We start by getting the keys for the selected object and then iterate through them. We use the keys to pull out the
   * value for each property. Based on the value's type we
   *
   * - call this method again (recursion) if it's another `Object` passing it the value
   * - call `cleanArray()` if an `Array` passing it the value
   * - pass the value to `cleanValue()`
   *
   * We store the result and then call `keepValue()` to determine if the property should be retained in the object. If
   * it should we add it to a new object we create and update as we loop through. Else we quietly drop it.
   *
   * @param {Object} obj The object you wish to loop through and clean
   * @returns {Object} The cleaned object
   */
  static _cleanObject (obj) {
    if (obj === null) {
      return null
    }

    const cleanedObj = {}

    for (const [key, value] of Object.entries(obj)) {
      let result
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          result = this._cleanArray(value)
        } else {
          result = this._cleanObject(value)
        }
      } else {
        result = this._cleanValue(value)
      }

      if (this._keepValue(result)) {
        cleanedObj[key] = result
      }
    }

    return cleanedObj
  }

  /**
   * Loop through an `Array` and clean each value
   *
   * This works in a similar way to `cleanObj()` only we iterate over the array directly.
   *
   * For each value in the array we check its type. We then
   *
   * - call this `cleanObj()` (recursion) if it's another `Object` passing it the value
   * - pass the value to `cleanValue()`
   *
   * We store the result and then call `keepValue()` to determine if the value should be retained in the array. If it
   * should we add it to a new array we create and update as we loop through. Else we quietly drop it.
   *
   * @param {Array} array The object you wish to loop through and clean
   * @returns {Array} The cleaned array
   */
  static _cleanArray (array) {
    const cleanedArray = []

    for (const item of array) {
      let result

      if (typeof item === 'object') {
        result = this._cleanObject(item)
      } else {
        result = this._cleanValue(item)
      }

      if (this._keepValue(result)) {
        cleanedArray.push(result)
      }
    }

    return cleanedArray
  }

  /**
   * Determine if a 'cleaned' value should be retained
   *
   * If either a value was sent empty or becomes empty as a result of cleaning, we don't want to see it in our
   * endpoints. We use this as part of other functions to determine whether to keep the value in the object.
   *
   * This includes objects which end up as `{}`, empty arrays, and empty strings
   *
   * @param value Value we are making the decision for
   * @returns `true` if the `Object`, `Array` or `String` is 'empty'. Else `false`
   */
  static _keepValue (value) {
    if (value === null) {
      return false
    } else if (typeof value === 'object') {
      return (Object.keys(value).length > 0)
    } else if (typeof value === 'string') {
      return (value !== '')
    }

    // If its not null, an object or a string assume we need to keep it!
    return true
  }

  /**
   * Clean a value from the object
   *
   * If the value is a `String` we perform a number of actions before returning it.
   *
   * - sanitize the value to remove anything potentially dangerous
   * - trim any extraneous whitespace
   * - if sanitizing the value escaped any characters, for example `>` as `&gt;`, we want to revert that change back
   *
   * Else we just return the value as is.
   *
   * @param value Value to be cleaned
   * @returns The 'cleaned' value if a `String` else the original value
   */
  static _cleanValue (value) {
    if (typeof value === 'string') {
      let cleanedValue = Sanitizer.sanitize(value)
      cleanedValue = cleanedValue.trim()
      cleanedValue = Sanitizer.unescapeEntities(cleanedValue)
      return cleanedValue
    }
    return value
  }
}

module.exports = ObjectCleaningService
