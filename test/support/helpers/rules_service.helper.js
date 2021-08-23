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
   * @param {integer} chargeValue The charge value in pence to be returned from the rules service.
   *
   * @returns {module:Sinon} A Sinon stub object
   */
  static mockValue (Sinon, RequestRulesServiceCharge, rulesServiceResponse, chargeValue) {
    return Sinon.stub(RequestRulesServiceCharge, 'go').returns({
      ...rulesServiceResponse,
      WRLSChargingResponse: {
        ...rulesServiceResponse.WRLSChargingResponse,
        chargeValue: chargeValue / 100
      }
    })
  }
}

module.exports = RulesServiceHelper
