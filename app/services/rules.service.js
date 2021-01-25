'use strict'

/**
 * @module RulesService
 */

const Got = require('got')
const Tunnel = require('tunnel')

const { RulesServiceConfig } = require('../../config')

/**
 * Handles requests to the Rules Service
 *
 * The rules service is an external API we call that does the actual calculation of a charge. We feed it the data it
 * needs for a particular regime and ruleset and it returns the charge value.
 *
 * Because each regime and ruleset has different rules for how a charge is calculated the rules service has an endpoint
 * for each one. Part of what this service does is determining the appropriate endpoint to call.
 */
class RulesService {
  /**
   * Initiator method of the service. When called the service will take the inputs, call the appropriate endpoint on the
   * rules service and return the response.
   *
   * In order to make the request to the rules service the following need to be provided by the `presenter` instance.
   *
   * - the regime slug, for example, 'wrls'
   * - the ruleset, for example, 'presroc'
   * - the financial year for the charge, for example, 2020
   * - the charge params which contains the values needed by the rules service to perform the relevant calculation
   *
   * The regime, ruleset and financial year are all used to determine which endpoint to call.
   *
   * @param {module:RulesServicePresenter} presenter An object that contains all the properties the service needs. Most
   *  likely to be an instance of `RulesServicePresenter`
   *
   * @returns {Object} The `response.body` provided after calling the rules service
   */
  static go (presenter) {
    const { url, username, password, httpProxy } = RulesServiceConfig
    const { ruleset, regime, financialYear, chargeParams } = presenter
    const path = this._makeRulesPath(ruleset, regime, financialYear)
    const requestOptions = this._requestOptions(url, chargeParams, username, password)
    const proxyOptions = httpProxy ? this._proxyOptions(httpProxy) : ''

    return this._callRulesService(path, requestOptions, proxyOptions)
  }

  /**
   * Determine the endpoint path
   *
   * We know the url. But the path will change depending in the regime, ruleset and financial year the charge is for.
   *
   * @param {string} rulesetId Name of the ruleset, for example, `presroc`
   * @param {string} regime The regime 'slug', for example, `wrls`
   * @param {integer} year  digit integer representing the year the charge was made
   *
   * @returns {string} The path to the appropriate endpoint to call on the rules service
   */
  static _makeRulesPath (rulesetId, regime, year) {
    const { application, ruleset } = RulesServiceConfig.endpoints[regime].rulesets[rulesetId]
    const suffix = this._yearSuffix(year)

    return `${application}/${ruleset}${suffix}`
  }

  static async _callRulesService (path, requestOptions, proxyOptions) {
    const response = await Got.post(path, { ...requestOptions, ...proxyOptions })

    return response.body
  }

  /**
   * Determine the year suffix for the endpoint path
   *
   * Each of the rules service endpoints ends with a year suffix. How a charge is calculated can change in different
   * financial years so we need to call an endpoint that matches when our charge is for.
   *
   * The suffix is based on the specified year, and the last 2 digits of the following year. For example
   *
   * - 2000 is `_2000_01`
   * - 2019 is `_2019_20`
   *
   * @param {integer} year 4 digit integer representing the year the charge was made
   *
   * @returns {string} the year suffix for the endpoint path
   */
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
