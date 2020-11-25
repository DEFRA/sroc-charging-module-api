'use strict'

class AuthorisedSystemsController {
  static async index (_req, h) {
    return h.response('Hello').code(200)
  }
}

module.exports = AuthorisedSystemsController
