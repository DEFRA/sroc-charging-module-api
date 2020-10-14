const Got = require('got')

const RulesServiceConfig = require('../../config/rules_service.config')

class RulesService {
  static call (regime, financialYear, chargeParams) {
    const { url, username, password } = RulesServiceConfig
    const path = this._makeRulesPath(regime, financialYear)

    const options = {
      prefixUrl: url,
      json: chargeParams,
      responseType: 'json',
      timeout: 1500,
      username,
      password
    }

    // TODO: Set options.proxy if a proxy is required

    return Got.post(path, options)
  }

  // Year suffix is '_2000_01' for 2000, '_2001_02' for 2001 etc.
  // ie. the year and the last two digits of the following year
  static _yearSuffix (year) {
    const nextYearDigits = (year + 1).toString().slice(2)
    return `_${year}_${nextYearDigits}`
  }

  // generate the path for the specified regime, year and ruleset
  static _makeRulesPath (regime, year) {
    const { application, ruleset } = RulesServiceConfig.endpoints[regime]
    const suffix = this._yearSuffix(year)
    return `${application}/${ruleset}${suffix}`
  }
}

module.exports = RulesService
