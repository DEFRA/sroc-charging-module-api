class RootController {
  static async index (_req, _h) {
    return { status: 'alive' }
  }
}

module.exports = RootController
