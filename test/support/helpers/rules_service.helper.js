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
}

module.exports = RulesServiceHelper
