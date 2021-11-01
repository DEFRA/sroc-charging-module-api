'use strict'

/**
 * @module CalculatePresrocChargeTranslator
 */

const BaseTranslator = require('./base.translator')
const Joi = require('joi').extend(require('@joi/date'))
const Boom = require('@hapi/boom')

class CalculatePresrocChargeTranslator extends BaseTranslator {
  constructor (data) {
    super(data)

    this.financialYear = this._financialYear(this.periodStart)

    // Additional post-getter validation to ensure periodStart and periodEnd are in the same financial year
    this._validateFinancialYear()
  }

  _validateFinancialYear () {
    const schema = Joi.object({
      periodEndFinancialYear: Joi.number().equal(this.financialYear)
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
      volume: rules.volume,
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
      periodEnd: Joi.date().format(validDateFormats).required(),
      periodStart: Joi.date().format(validDateFormats).min('01-APR-2021').max(Joi.ref('periodEnd')).required(),
      section127Agreement: Joi.boolean().required(),
      section130Agreement: Joi.boolean().required(),
      supportedSource: Joi.boolean().required(),
      volume: Joi.number().min(0).required(),
      waterCompanyCharge: Joi.boolean().required(),
      winterOnly: Joi.boolean().required(),

      // Dependent on `compensationCharge`
      compensationCharge: Joi.boolean().required(),
      regionalChargingArea: Joi.when('compensationCharge', { is: true, then: Joi.string().required() }),
      waterUndertaker: Joi.when('compensationCharge', { is: true, then: Joi.boolean().required() }),

      // Dependent on `twoPartTariff`
      twoPartTariff: Joi.boolean().required(),
      actualVolume: Joi.when('twoPartTariff', { is: true, then: Joi.number().greater(0).required() }),

      // strings validated by the rules service
      chargeCategoryCode: Joi.string().required(),
      loss: Joi.string().required(),
      supportedSourceName: Joi.when('supportedSource', { is: true, then: Joi.string().required() }),

      // needed to determine which endpoints to call in the rules service
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
      financialYear: 'financialYear', // this field is added in `constructor()`
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
      volume: 'volume',
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
}

module.exports = CalculatePresrocChargeTranslator
