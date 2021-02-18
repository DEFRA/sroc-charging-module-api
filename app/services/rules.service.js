'use strict'

/**
 * @module RulesService
 */

const Got = require('got')
const Tunnel = require('tunnel')
const Boom = require('@hapi/boom')

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
  static async go (presenter) {
    const { url, username, password, httpProxy } = RulesServiceConfig
    const { ruleset, regime, financialYear, chargeParams } = presenter
    const path = this._makeRulesPath(ruleset, regime, financialYear)
    const requestOptions = this._requestOptions(url, chargeParams, username, password)
    const proxyOptions = httpProxy ? this._proxyOptions(httpProxy) : ''

    try {
      const response = await this._callRulesService(path, requestOptions, proxyOptions)
      await this._handleMessages(response)
      return response
    } catch (error) {
      await this._handleErrors(error)
    }
  }

  /**
   * Sending certain incorrect parameters will cause the rules service to return an invalid response -- this is
   * indicated by WRLSChargingResponse.messages being populated with one or more error messages, but in all other
   * respects the response looks like a valid one. Therefore we need to check if the messages array is populated so we
   * can throw an error if it is.
   */
  static async _handleMessages (response) {
    if (response.WRLSChargingResponse && response.WRLSChargingResponse.messages) {
      const { messages } = response.WRLSChargingResponse
      if (messages.length) {
        throw Boom.badData(`Rules service returned the following: ${messages.join(', ')}`)
      }
    }
  }

  static async _handleErrors (error) {
    // TODO: handle 404 error so it returns a message along the lines of "ruleset not found, check periodStart"

    // Handle rules service error resulting from incorrect data
    if (error.name === 'HTTPError') {
      throw Boom.badData(`Rules service error: ${error.message}`)
    }

    // Handle network error:
    if (error.name === 'RequestError') {
      throw Boom.badRequest(`Error communicating with the rules service: ${error.code}`)
    }

    // Handle everything else:
    throw Boom.boomify(error)
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
    const response = await Got.post(path, {
      ...requestOptions,
      ...proxyOptions
      // ...proxyOptions,
      // hooks: {
      //   beforeError: this._assignBodyMessageToErrorMessage()
      // }
    })
    return response.body
  }

  /**
   * In some circumstances (eg. a 404 error is returned due to invalid periodStart/periodEnd values) the error message
   * we want to return to the user is returned to us in response.body.message rather than error.message. Adding a
   * beforeError hook allows us to capture it and assign it to the error message.
   *
   * Adapated from the sample hook in the Got docs:
   * https://github.com/sindresorhus/got/#hooksbeforeerror
   */
  static _assignBodyMessageToErrorMessage () {
    return [
      error => {
        const { response } = error
        if (response && response.body) {
          error.message = `${response.body.message}`
        }

        return error
      }
    ]
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
