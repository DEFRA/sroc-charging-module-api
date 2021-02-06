'use strict'

const { RulesServiceConfig } = require('../../../config')

class RulesServiceHelper {
  static get url () {
    return RulesServiceConfig.url
  }

  static application (regime, ruleset) {
    return RulesServiceConfig.endpoints[regime].rulesets[ruleset].application
  }

  static ruleset (regime, ruleset) {
    return RulesServiceConfig.endpoints[regime].rulesets[ruleset].ruleset
  }

  static path (regime, ruleset) {
    const applicationPath = this.application(regime, ruleset)
    const rulesetPath = this.ruleset(regime, ruleset)

    return `${applicationPath}/${rulesetPath}`
  }

  /**
   * Mock the rules service to return a specific charge value.
   *
   * @param {object} Sinon The instance of Sinon used in test.
   * @param {object} rulesServiceResponse The rules service response fixture used in test.
   * @param {integer} chargeValue The charge value to be returned from the rules service.
   */
  static mockValue (Sinon, RulesService, rulesServiceResponse, chargeValue) {
    Sinon.stub(RulesService, 'go').returns({
      ...rulesServiceResponse,
      WRLSChargingResponse: {
        ...rulesServiceResponse.WRLSChargingResponse,
        chargeValue
      }
    })
  }
}

module.exports = RulesServiceHelper
