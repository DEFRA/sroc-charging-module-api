'use strict'

class RootController {
  static async index (req, h) {
    return { status: 'alive' }
  }
}

module.exports = RootController
