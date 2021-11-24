'use strict'

/**
 * @module RulesServicePresrocTranslator
 */

const BaseTranslator = require('./base.translator')
const Joi = require('joi')

class RulesServiceSrocTranslator extends BaseTranslator {
  constructor (data) {
    // The rules service returns the data we need in a WRLSChargingResponse object within the response object
    super(data.WRLSChargingResponse)

    // We retain a copy of the actual response for audit purposes
    this.chargeCalculation = JSON.stringify(data)

    this.chargeValue = this._convertToPence(this._data.chargeValue)
    this.headerAttr9 = this._convertToPence(this._data.baselineCharge)
    this.headerAttr10 = this._convertToPence(this._data.waterCompanyCharge)
    this.lineAttr11 = this._convertToPence(this._data.supportedSourceCharge)

    // Extract factor value from strings
    this.lineAttr12 = this._extractFactor(this._data.winterOnlyAdjustment)
    this.lineAttr9 = this._extractFactor(this._data.s130Agreement)
    this.lineAttr15 = this._extractFactor(this._data.s127Agreement)

    // Convert percentage string to value. Note that this will be `null` if the Rules Service did not return a value
    this.regimeValue2 = this._convertPercentage(this._data.compensationChargePercentage)
  }

  _schema () {
    return Joi.object({
      chargeValue: Joi.number().required(),
      baselineCharge: Joi.number().required(),
      waterCompanyCharge: Joi.number().required(),
      supportedSourceCharge: Joi.number().required(),
      winterOnlyAdjustment: Joi.required(),
      s130Agreement: Joi.required(),
      s127Agreement: Joi.required(),
      // compensationChargePercentage is only returned if this was a compensation charge. If it isn't returned then we
      // default it to `null`
      compensationChargePercentage: Joi.string().default(null)
    }).options({ stripUnknown: true })
  }

  // All items in the response require conversion, which is done in constructor(). Therefore no translations are needed.
  _translations () {
    return { }
  }

  _convertToPence (value) {
    const floatValue = parseFloat(value)

    return Math.round(floatValue * 100)
  }

  /**
   * Extracts the factor value from a string.
   *
   * Some responses from the Rules Service are in the form of a string with the factor value at the end, eg. `Winter
   * Only Discount 0.5`. We extract the factor value and return it as a number.
   */
  _extractFactor (string) {
    if (string === null) {
      return null
    }

    // Split the string into separate words and extract the last one (which will be the factor)
    const splitString = string.split(' ')
    const factor = splitString.pop()

    // We use Joi to convert the factor to ensure we have correctly validated it as a number (as so far we have only
    // validated that we received a string from the Rules Service)
    return Joi.attempt(factor, Joi.number())
  }

  /**
   * Converts a string percentage into a value.
   *
   * The Rules Service returns a percentage as a string in the form `50%`. We convert this to a number `50`. In some
   * situations the Rules Service does not return any value. In this situation we will have previously defaulted it to
   * `null` during validation, and we therefore return `null` from here.
   */
  _convertPercentage (percentageString) {
    if (!percentageString) {
      return null
    }

    // parseFloat() will parse the passed-in string up to the first non-number character so this will give us the number
    // part of the percentage string.
    const percentageFloat = parseFloat(percentageString)

    // parseFloat() will give us `NaN` if it can't parse percentageString. We want to ensure that all data coming back
    // from the Rules Service is validated, and so far we have only validated that we received a string). We therefore
    // use Joi to confirm that the value we've ended up with is actually a number.
    Joi.assert(percentageFloat, Joi.number())

    return percentageFloat
  }
}

module.exports = RulesServiceSrocTranslator
