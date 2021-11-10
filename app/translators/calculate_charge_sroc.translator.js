'use strict'

/**
 * @module CalculateChargeSrocTranslator
 */

const BaseTranslator = require('./base.translator')
const Joi = require('joi').extend(require('@joi/date'))
const Boom = require('@hapi/boom')

class CalculateChargeSrocTranslator extends BaseTranslator {
  constructor (data) {
    super(data)

    this.chargeFinancialYear = this._financialYear(this.periodStart)

    // Additional post-getter validation to ensure periodStart and periodEnd are in the same financial year
    this._validateFinancialYear()
  }

  _validateFinancialYear () {
    const schema = Joi.object({
      periodEndFinancialYear: Joi.number().equal(this.chargeFinancialYear)
    })

    const data = {
      periodEndFinancialYear: this._financialYear(this.periodEnd)
    }

    const { error } = schema.validate(data)

    if (error) {
      throw Boom.badData(error)
    }
  }

  _schema () {
    const rules = this._rules()

    return Joi.object({
      abatementFactor: rules.abatementFactor,
      actualVolume: rules.actualVolume,
      authorisedVolume: rules.authorisedVolume,
      aggregateProportion: rules.aggregateProportion,
      authorisedDays: rules.authorisedDays,
      billableDays: rules.billableDays,
      chargeCategoryCode: rules.chargeCategoryCode,
      compensationCharge: rules.compensationCharge,
      credit: rules.credit,
      // Note that financialYear is added in constructor()
      loss: rules.loss,
      periodEnd: rules.periodEnd,
      periodStart: rules.periodStart,
      regime: rules.regime,
      regionalChargingArea: rules.regionalChargingArea,
      ruleset: rules.ruleset,
      section127Agreement: rules.section127Agreement,
      section130Agreement: rules.section130Agreement,
      supportedSource: rules.supportedSource,
      supportedSourceName: rules.supportedSourceName,
      twoPartTariff: rules.twoPartTariff,
      waterCompanyCharge: rules.waterCompanyCharge,
      waterUndertaker: rules.waterUndertaker,
      winterOnly: rules.winterOnly
    })
  }

  _rules () {
    const validDateFormats = ['DD-MMM-YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY', 'YYYY/MM/DD']

    return {
      ruleset: Joi.string().valid('sroc').required(),

      abatementFactor: Joi.number().allow(null).empty(null).default(1.0),
      aggregateProportion: Joi.number().allow(null).empty(null).default(1.0),
      authorisedDays: Joi.number().integer().min(0).max(366).required(),
      billableDays: Joi.number().integer().min(0).max(366).required(),
      credit: Joi.boolean().required(),
      // Case-insensitive validation matches and returns the correctly-capitalised string
      loss: Joi.string().valid(...this._validLosses()).insensitive().required(),
      periodEnd: Joi.date().format(validDateFormats).required(),
      periodStart: Joi.date().format(validDateFormats).min('01-APR-2022').max(Joi.ref('periodEnd')).required(),
      section130Agreement: Joi.boolean().required(),
      authorisedVolume: Joi.number().greater(0).required(),
      waterCompanyCharge: Joi.boolean().required(),
      winterOnly: Joi.boolean().required(),

      // Dependent on `compensationCharge`
      compensationCharge: Joi.boolean().required(),
      // Case-insensitive validation matches and returns the correctly-capitalised string
      regionalChargingArea: Joi.string().valid(...this._validRegionalChargingAreas()).insensitive()
        .when('compensationCharge', { is: true, then: Joi.required() }),
      waterUndertaker: Joi.boolean()
        .when('compensationCharge', { is: true, then: Joi.required() }),

      // Dependent on `twoPartTariff`
      twoPartTariff: Joi.boolean().required()
        .when('compensationCharge', { is: true, then: Joi.equal(false) }),
      actualVolume: Joi.number().greater(0)
        .when('twoPartTariff', { is: true, then: Joi.required() }),

      // Dependent on both `compensationCharge` and `twoPartTariff`
      section127Agreement: Joi.boolean().required()
        .when('compensationCharge', { is: true, then: Joi.equal(false) })
        .when('twoPartTariff', { is: true, then: Joi.equal(true) }),

      // Dependent on `supportedSource`
      supportedSource: Joi.boolean().required(),
      // Case-insensitive validation matches and returns the correctly-capitalised string
      supportedSourceName: Joi.string().valid(...this._validSupportedSourceNames()).insensitive()
        .when('supportedSource', { is: true, then: Joi.required() }),

      // Validated by the rules service
      chargeCategoryCode: Joi.string().required(),

      // Needed to determine which endpoints to call in the rules service
      regime: Joi.string().required()
    }
  }

  // TODO: Translations need to be sorted correctly to use db fields as required eg. `regimeValue5` etc. For now we simply translate to the same string as the input
  _translations () {
    return {
      abatementFactor: 'abatementFactor',
      actualVolume: 'actualVolume',
      aggregateProportion: 'aggregateProportion',
      authorisedDays: 'authorisedDays',
      billableDays: 'billableDays',
      chargeCategoryCode: 'chargeCategoryCode',
      compensationCharge: 'compensationCharge',
      credit: 'credit',
      loss: 'loss',
      periodEnd: 'periodEnd',
      periodStart: 'periodStart',
      regime: 'regime',
      regionalChargingArea: 'regionalChargingArea',
      ruleset: 'ruleset',
      section127Agreement: 'section127Agreement',
      section130Agreement: 'section130Agreement',
      supportedSource: 'supportedSource',
      supportedSourceName: 'supportedSourceName',
      twoPartTariff: 'twoPartTariff',
      authorisedVolume: 'authorisedVolume',
      waterCompanyCharge: 'waterCompanyCharge',
      waterUndertaker: 'waterUndertaker',
      winterOnly: 'winterOnly'
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
    const periodDate = new Date(date)
    const month = periodDate.getMonth()
    const year = periodDate.getFullYear()

    return (month <= 2 ? year - 1 : year)
  }

  _validLosses () {
    return ['Low', 'Medium', 'High']
  }

  _validRegionalChargingAreas () {
    return [
      'Anglian',
      'Midlands',
      'Northumbria',
      'North West',
      'Southern',
      'South West (incl Wessex)',
      'Devon and Cornwall (South West)',
      'North and South Wessex',
      'Thames',
      'Yorkshire',
      'Dee',
      'Wye',
      'Wales'
    ]
  }

  _validSupportedSourceNames () {
    return [
      'Candover',
      'Dee',
      'Earl Soham - Deben',
      'Glen Groundwater',
      'Great East Anglian Groundwater',
      'Great East Anglian Surface Water',
      'Kielder',
      'Lodes Granta Groundwater',
      'Lower Yorkshire Derwent',
      'Medway - Allington',
      'Nene – Northampton',
      'Nene – Water Newton',
      'Ouse - Offord',
      'Ouse – Eaton Socon',
      'Ouse – Hermitage',
      'Rhee Groundwater',
      'Severn',
      'Thames',
      'Thet and Little Ouse Surface Water',
      'Waveney Groundwater',
      'Waveney Surface Water',
      'Welland – Tinwell Sluices',
      'Witham and Ancholme',
      'Wye'
    ]
  }
}

module.exports = CalculateChargeSrocTranslator
