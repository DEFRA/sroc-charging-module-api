'use strict'

const Boom = require('@hapi/boom')

/**
 * Converts an object to a JSON string and then tests if it contains any of the following characters:
 *
 * - {@link https://unicode-table.com/en/00A3| £ Pound Sign}
 * - {@link https://unicode-table.com/en/003F| ? Question Mark}
 * - {@link https://unicode-table.com/en/005E| ^ Circumflex (aka caret)}
 * - {@link https://unicode-table.com/en/2014| — Em dash}
 * - {@link https://unicode-table.com/en/2264| ≤ Less-Than or Equal To}
 * - {@link https://unicode-table.com/en/2265| ≥ Greater-Than or Equal To}
 * - {@link https://unicode-table.com/en/201C| “ Left Double Quotation Mark}
 * - {@link https://unicode-table.com/en/201D| ” Right Double Quotation Mark}
 *
 * @param {Object} obj The object you wish to check for invalid characters
 *
 * @returns {boolean} `true` if the object contains an invalid character, else `false`
 */
const invalidCharacters = obj => {
  const jsonObj = JSON.stringify(obj)

  if (jsonObj.match(/[?£^\u2014\u2264\u2265\u201C\u201D]/)) {
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
        throw Boom.badData('We cannot accept any request that contains the following characters: ? £ ^ — ≤ ≥ “ ”')
      }

      return h.continue
    })
  }
}

module.exports = InvalidCharactersPlugin
