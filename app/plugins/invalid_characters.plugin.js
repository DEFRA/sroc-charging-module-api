const Boom = require('@hapi/boom')

/**
 * Converts an object to a JSON string and then tests if it contains any of the following characters: ? £ ≤ ≥
 *
 * @param {Object} obj The object you wish to check for invalid characters
 * @returns {boolean} `true` if the object contains an invalid character, else `false`
 */
const invalidCharacters = obj => {
  const jsonObj = JSON.stringify(obj)

  if (jsonObj.match(/[?£\u2014\u2264\u2265]/)) {
    return true
  }

  return false
}

const InvalidCharactersPlugin = {
  name: 'invalid_characters',
  register: (server, _options) => {
    server.ext('onPostAuth', (request, h) => {
      if (!request.payload) {
        return h.continue
      }

      if (invalidCharacters(request.payload)) {
        throw Boom.badData('We cannot accept any request that contains the following characters: ? £ ≤ ≥')
      }

      return h.continue
    })
  }
}

module.exports = InvalidCharactersPlugin
