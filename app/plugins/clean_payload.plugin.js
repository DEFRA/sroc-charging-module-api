'use strict'

/**
 * Loop through an object and 'clean' it. This involves removing unnecessary whitespace and removing properties that
 * are empty.
 *
 * It will handle nested objects as well. For example
 *
 * ```
 * {
 *   age: 23,
 *   location: 'Bristol',
 *   name: {
 *     firstname: 'Tom',
 *     lastname: 'Thumb ',
 *     nickname: ''
 *   }
 * }
 * ```
 *
 * The result after cleaning would be
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
 * * @module CleanPayloadPlugin
 */

/**
 * Return a copy of an object where whitespace on any string values has been trimmed, and any empty or null properties
 * are removed.
 *
 * The magic comes from
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries|Object.entries()}
 * which returns an array of a given object's own enumerable string-keyed property `[key, value]` pairs. Our first
 * action is to filter out any where the value is `''` or `null`.
 *
 * We then use `map()` to apply `cleanProperty()` to each property that remains. If the property type is another object
 * `cleanProperty()` will use recursion and call `cleanObj()` again passing in the object. Else it will call `trim()` on
 * it and return the trimmed value.
 *
 * Once this has been applied to all the properties of an object (and its nested objects) we again filter out any empty
 * properties before passing the result to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries|Object.fromEntries()}
 * which transforms a list of key-value pairs into an object.
 *
 * Source: {@link https://stackoverflow.com/a/41550077/6117745}
 *
 * @param {Object} obj The object you wish to loop through and clean
 *
 */
const cleanObj = obj =>
  Object.fromEntries(
    Object.entries(obj)
      .filter(([_key, val]) => filter(val))
      .map(([key, val]) => cleanProperty(key, val))
      .filter(([_key, val]) => filter(val))
  )

const filter = value => {
  if (value !== null && value !== '') {
    return true
  }

  return false
}

const cleanProperty = (key, value) => {
  if (typeof value === 'object') {
    // The property is another object so use recursion and pass it back into this function
    return [key, cleanObj(value)]
  } else if (typeof value === 'string') {
    // Call trim() on it and return the result
    return [key, value.trim()]
  }

  // Return the value as is
  return [key, value]
}

const CleanPayloadPlugin = {
  name: 'clean_payload',
  register: (server, _options) => {
    server.ext('onPostAuth', (request, h) => {
      if (!request.payload) {
        return h.continue
      }
      request.payload = cleanObj(request.payload)

      return h.continue
    })
  }
}

module.exports = CleanPayloadPlugin
