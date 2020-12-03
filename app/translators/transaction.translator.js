' use strict'

const BaseTranslator = require('./base.translator')
const Joi = require('joi')
const Boom = require('@hapi/boom')

class TransactionTranslator extends BaseTranslator {
  constructor (data) {
    super(data)

    this.lineAttr3 = this._prorataDays()
    this.chargeFinancialYear = this._financialYear(this.chargePeriodStart)

    // Additional post-getter validation to ensure periodStart and periodEnd are in the same financial year
    this._validateFinancialYear()
  }

  _translations () {
    return {
      region: 'region',
      customerReference: 'customerReference',
      batchNumber: 'regimeValue1',
      licenceNumber: 'lineAttr1',
      chargePeriod: 'lineAttr2',
      chargeElementId: 'regimeValue3',
      areaCode: 'lineAreaCode',
      lineDescription: 'lineDescription',
      newLicence: 'newLicence',
      clientId: 'clientId',
      ruleset: 'ruleset',
      periodStart: 'chargePeriodStart',
      periodEnd: 'chargePeriodEnd',
      credit: 'chargeCredit',
      billableDays: 'regimeValue4',
      authorisedDays: 'regimeValue5',
      volume: 'lineAttr5',
      source: 'regimeValue6',
      season: 'regimeValue7',
      loss: 'regimeValue8',
      section130Agreement: 'regimeValue9',
      section126Agreement: 'regimeValue10',
      section126Factor: 'regimeValue11',
      section127Agreement: 'regimeValue12',
      twoPartTariff: 'regimeValue16',
      compensationCharge: 'regimeValue17',
      eiucSource: 'regimeValue13',
      waterUndertaker: 'regimeValue14',
      regionalChargingArea: 'regimeValue15',
      prorataDays: 'lineAttr3',
      chargeFinancialYear: 'chargeFinancialYear'
    }
  }

  _schema () {
    return Joi.object({
      region: Joi.string().uppercase().valid(...this._validRegions()),
      customerReference: Joi.string().uppercase().max(12).required(),
      batchNumber: Joi.string().allow('', null),
      licenceNumber: Joi.string().max(150).required(),
      chargePeriod: Joi.string().required(),
      chargeElementId: Joi.string().allow('', null),
      areaCode: Joi.string().uppercase().valid(...this._validAreas()),
      lineDescription: Joi.string().max(240).required(),
      newLicence: Joi.boolean().default(false),
      clientId: Joi.string().allow('', null),
      // Set a new field called ruleset. This will be used to determine which ruleset to query in the rules service
      ruleset: Joi.string().default('presroc'),
      periodStart: Joi.date().less(Joi.ref('periodEnd')).min('01-APR-2014').required(),
      periodEnd: Joi.date().required(),
      credit: Joi.boolean().required(),
      billableDays: Joi.number().integer().min(0).max(366).required(),
      authorisedDays: Joi.number().integer().min(0).max(366).required(),
      volume: Joi.number().min(0),
      source: Joi.string().required(), // validated in rules service
      season: Joi.string().required(), // validated in rules service
      loss: Joi.string().required(), // validated in rules service
      section130Agreement: Joi.boolean().required(),
      section126Factor: Joi.number().allow(null).empty(null).default(1.0),
      section127Agreement: Joi.boolean().required(),
      twoPartTariff: Joi.boolean().required(),
      compensationCharge: Joi.boolean().required(),
      eiucSource: Joi.when('compensationCharge', { is: true, then: Joi.string().required() }), // validated in the rules service
      waterUndertaker: Joi.boolean().required(),
      regionalChargingArea: Joi.string().required() // validated in the rules service
    })
  }

  _validateFinancialYear () {
    const schema = Joi.object({
      chargePeriodEndFinancialYear: Joi.number().equal(this.chargeFinancialYear)
    })

    const data = {
      chargePeriodEndFinancialYear: this._financialYear(this.chargePeriodEnd)
    }

    const { error } = schema.validate(data)

    if (error) {
      throw Boom.badData(error)
    }
  }

  /**
   * Returns the calculated financial year for a given date
   *
   * If the date is January to March then the financial year is the previous year. Otherwise, the financial year is the
   * current year.
   *
   * For example, if the date is 01-MAR-2022 then the financial year will be 2021. If the it's 01-MAY-2022 then the
   * financial year will be 2022.
   *
   * @param {String} date
   * @returns {Number} The calculated financial year
  */
  _financialYear (date) {
    const chargePeriodDate = new Date(date)
    const month = chargePeriodDate.getMonth()
    const year = chargePeriodDate.getFullYear()

    return (month <= 2 ? year - 1 : year)
  }

  /**
   * Returns billable and authorised day values as a specially formatted string.
   *
   * For example, if billable days is 12 and authorised days is 6 it will return `012/006`.
   *
   * @returns {String} Billable days and authorised days as a formatted string
   */
  _prorataDays () {
    return `${this._padNumber(this.regimeValue4)}/${this._padNumber(this.regimeValue5)}`
  }

  _validRegions () {
    return ['A', 'B', 'E', 'N', 'S', 'T', 'W', 'Y']
  }

  /**
   * Return a number as a string, padded to 3 digits with leading zeroes
   *
   * For example, `_padNumber(3)` will return `003`.
   *
   * @returns {Number} the number padded with leading zeroes
   */
  _padNumber (number) {
    return number.toString().padStart(3, '0')
  }

  _validAreas () {
    return [
      'ARCA',
      'AREA',
      'ARNA',
      'CASC',
      'MIDLS',
      'MIDLT',
      'MIDUS',
      'MIDUT',
      'AACOR',
      'AADEV',
      'AANWX',
      'AASWX',
      'NWCEN',
      'NWNTH',
      'NWSTH',
      'HAAR',
      'KAEA',
      'SAAR',
      'AGY2N',
      'AGY2S',
      'AGY3',
      'AGY3N',
      'AGY3S',
      'AGY4N',
      'AGY4S',
      'N',
      'SE',
      'SE1',
      'SE2',
      'SW',
      'ABNRTH',
      'DALES',
      'NAREA',
      'RIDIN',
      'DEFAULT',
      'MULTI'
    ]
  }
}

module.exports = TransactionTranslator
