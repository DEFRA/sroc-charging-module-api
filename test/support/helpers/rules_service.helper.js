'use strict'

const { RulesServiceConfig } = require('../../../config')

class RulesServiceHelper {
  static get url () {
    return RulesServiceConfig.url
  }

  static application (regime) {
    return RulesServiceConfig.endpoints[regime].application
  }

  static ruleset (regime) {
    return RulesServiceConfig.endpoints[regime].ruleset
  }

  static response (regime) {
    return require(`../fixtures/${regime}/rules_service_response.json`)
  }

  static request (regime) {
    return require(`../fixtures/${regime}/rules_service_request.json`)
  }

  // Helper function to return all data for a given regime in one go
  static allRulesData (regime) {
    return {
      application: this.application(regime),
      ruleset: this.ruleset(regime),
      response: this.response(regime),
      request: this.request(regime)
    }
  }
}

module.exports = RulesServiceHelper
