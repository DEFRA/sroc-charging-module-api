'use strict'

const { RegimeModel } = require('../models')

class RegimesController {
  static async index (_req, _h) {
    return RegimeModel
      .query()
  }

  static async show (req, _h) {
    return RegimeModel
      .query()
      .findById(req.params.id)
  }
}

module.exports = RegimesController
