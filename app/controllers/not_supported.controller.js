const Boom = require('@hapi/boom')

class NotSupportedController {
  static async index (_req, _h) {
    throw Boom.resourceGone('This version of the resource is no longer available. There may be an updated version.')
  }
}

module.exports = NotSupportedController
