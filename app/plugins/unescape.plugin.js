'use strict'

const Sanitizer = require('sanitizer')

/**
 * Loop through an object and unescape any HTML escaped values
 *
 * This assumes you are passing in an object that may have child objects. For example
 *
 * ```
 * {
 *   age: 23,
 *   location: 'Bristol',
 *   name: {
 *     firstname: 'Tom',
 *     lastname: 'Thumb'
 *   }
 * }
 * ```
 *
 * It uses recursion plus some ES10/2019 magic to loop through the keys (properties) in the object. When it encounters a
 * string value it passes it to `Sanitizer.unescapeEntities()`. If it encounters another object it calls itself again!
 *
 * The magic comes from
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries|Object.entries()}
 * which returns an array of a given object's own enumerable string-keyed property `[key, value]` pairs. Also
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries|Object.fromEntries()}
 * which transforms a list of key-value pairs into an object.
 *
 * Source: {@link https://stackoverflow.com/a/41550077/6117745}
 *
 * @param {Object} obj The object you wish to loop through and unescape any string values
 *
 */
const unescapeObj = obj =>
  Object.fromEntries(
    Object.entries(obj).map(([key, val]) => {
      if (val && typeof val === 'object') {
        // The property is another object so use recursion and pass it back into this function
        return [key, unescapeObj(val)]
      } else {
        // Unescape the value
        return [key, Sanitizer.unescapeEntities(val)]
      }
    })
  )

const UnescapePlugin = {
  name: 'unescape',
  register: (server, _options) => {
    server.ext('onPostAuth', (request, h) => {
      if (!request.payload) {
        return h.continue
      }

      request.payload = unescapeObj(request.payload)

      return h.continue
    })
  }
}

module.exports = UnescapePlugin
