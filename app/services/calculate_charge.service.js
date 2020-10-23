'use strict'

const RulesService = require('./rules.service')

// This service passes a translator object to the rules service
// The response from the rules service is used to create a new presenter which is returned
class CalculateChargeService {
  static async call (translator, Presenter) {
    const response = await RulesService.call(translator)
    return new Presenter(response)
  }
}

module.exports = CalculateChargeService
