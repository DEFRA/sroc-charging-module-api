'use strict'

const { RegimeModel } = require('../models')

class RegimesController {
  static async index (_req, _h) {
    const regimes = await RegimeModel
      .query()

    return regimes
  }

  static async show (req, h) {
    const regime = await RegimeModel
      .query()
      .findById(req.params.id)

    return regime
  }
}

module.exports = RegimesController
