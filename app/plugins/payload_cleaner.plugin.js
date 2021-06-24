const { ObjectCleaningService } = require('../services')

/**
 * Loop through a request's payload and 'clean' it.
 *
 * When a payload comes in there are a number of things we want to do to its values
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
 * This plugin handles this for us
 *
 * * @module CleanPayloadPlugin
 */

const PayloadCleanerPlugin = {
  name: 'payload_cleaner',
  register: (server, _options) => {
    server.ext('onPostAuth', (request, h) => {
      if (!request.payload) {
        return h.continue
      }

      request.payload = ObjectCleaningService.go(request.payload)

      return h.continue
    })
  }
}

module.exports = PayloadCleanerPlugin
