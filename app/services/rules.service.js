'use strict'

const Got = require('got')
const Tunnel = require('tunnel')

const { RulesServiceConfig } = require('../../config')

class RulesService {
  // The following properties are taken from the passed-in translator object:
  // * Regime is the regime in lower case text, eg. wrls
  // * financialYear is the 4-digit year, eg. 2020
  // * chargeParams is an object containing the parameters to be passed to the rules service
  static go (presenter) {
    const { url, username, password, httpProxy } = RulesServiceConfig
    const { regime, financialYear, chargeParams } = presenter
    const path = this._makeRulesPath(regime, financialYear)
    const requestOptions = this._requestOptions(url, chargeParams, username, password)
    const proxyOptions = httpProxy ? this._proxyOptions(httpProxy) : ''

    return Got.post(path, { ...requestOptions, ...proxyOptions })
  }

  // generate the path for the specified regime, year and ruleset
  static _makeRulesPath (regime, year) {
    const { application, ruleset } = RulesServiceConfig.endpoints[regime]
    const suffix = this._yearSuffix(year)
    return `${application}/${ruleset}${suffix}`
  }

  // Year suffix is '_2000_01' for 2000, '_2001_02' for 2001 etc.
  // ie. the year and the last two digits of the following year
  static _yearSuffix (year) {
    const nextYearDigits = (year + 1).toString().slice(2)
    return `_${year}_${nextYearDigits}`
  }

  static _requestOptions (url, chargeParams, username, password) {
    return {
      prefixUrl: url,
      json: chargeParams,
      responseType: 'json',
      timeout: 5000,
      username,
      password
    }
  }

  static _proxyOptions (httpProxy) {
    return {
      agent: {
        https: Tunnel.httpsOverHttp({
          proxy: {
            host: httpProxy
          }
        })
      }
    }
  }
}

module.exports = RulesService
