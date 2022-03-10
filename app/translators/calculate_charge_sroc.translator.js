'use strict'

/**
 * @module CalculateChargeSrocTranslator
 */

const Joi = require('joi').extend(require('@joi/date'))

const CalculateChargeBaseTranslator = require('./calculate_charge_base.translator')

class CalculateChargeSrocTranslator extends CalculateChargeBaseTranslator {
  constructor (data) {
    super(data)

    this.lineAttr3 = this._prorataDays()
    this.chargeFinancialYear = this._financialYear(this.chargePeriodStart)

    // Additional post-getter validation to ensure periodStart and periodEnd are in the same financial year
    this._validateFinancialYear()
  }

  _rules () {
    return {
      ...this._baseRules(),
      ruleset: Joi.string().valid('sroc').required(),

      abatementFactor: Joi.number().greater(0).required(),
      adjustmentFactor: Joi.number().greater(0).required(),
      aggregateProportion: Joi.number().greater(0).required(),
      periodStart: Joi.date().format(this._validDateFormats()).min('01-APR-2021').max(Joi.ref('periodEnd')).required(),
      authorisedVolume: Joi.number().greater(0).required(),
      waterCompanyCharge: Joi.boolean().required(),
      winterOnly: Joi.boolean().required(),

      // Dependent on `twoPartTariff`
      actualVolume: Joi.number().greater(0)
        .when('twoPartTariff', { is: true, then: Joi.required() }),

      // Dependent on `supportedSource`
      supportedSource: Joi.boolean().required(),
      supportedSourceName: Joi
        // If `true` then we match and return the correctly-capitalised string
        .when('supportedSource', { is: true, then: this._validateStringAgainstList(this._validSupportedSourceNames()).required() })
        // If `false` then this should be undefined (ie. not present) and we set the value as `Not Applicable`
        .when('supportedSource', { is: false, then: Joi.forbidden().default('Not Applicable') }),

      // Dependent on `compensationCharge` and `waterCompanyCharge`
      waterUndertaker: Joi.boolean()
        .when('compensationCharge', {
          is: true,
          then: Joi
            // If compensationCharge is `true` then waterUndertaker is required
            .required()
            // And if waterCompanyCharge is `true` then waterUndertaker must also be `true`
            .when('waterCompanyCharge', { is: true, then: Joi.equal(true) })
        }),

      // Dependent on `compensationCharge` and case-insensitive to return the correctly-capitalised string
      regionalChargingArea: this._validateStringAgainstList(this._validRegionalChargingAreas())
        .when('compensationCharge', { is: true, then: Joi.required() }),

      // Validated by the rules service
      chargeCategoryCode: Joi.string().required()
    }
  }

  _translations () {
    return {
      abatementFactor: 'regimeValue11',
      actualVolume: 'regimeValue20',
      adjustmentFactor: 'regimeValue19',
      aggregateProportion: 'headerAttr2',
      authorisedDays: 'regimeValue5',
      authorisedVolume: 'headerAttr3',
      billableDays: 'regimeValue4',
      chargeCategoryCode: 'headerAttr4',
      compensationCharge: 'regimeValue17',
      credit: 'chargeCredit',
      loss: 'regimeValue8',
      periodEnd: 'chargePeriodEnd',
      periodStart: 'chargePeriodStart',
      regime: 'regime',
      regionalChargingArea: 'regimeValue15',
      ruleset: 'ruleset',
      section127Agreement: 'regimeValue12',
      section130Agreement: 'regimeValue9',
      supportedSource: 'headerAttr5',
      supportedSourceName: 'headerAttr6',
      twoPartTariff: 'regimeValue16',
      waterCompanyCharge: 'headerAttr7',
      waterUndertaker: 'regimeValue14',
      winterOnly: 'headerAttr8'
    }
  }

  _validLosses () {
    return ['Low', 'Medium', 'High']
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
      'Nene - Northampton',
      'Nene - Water Newton',
      'Ouse - Offord',
      'Ouse - Eaton Socon',
      'Ouse - Hermitage',
      'Rhee Groundwater',
      'Severn',
      'Thames',
      'Thet and Little Ouse Surface Water',
      'Waveney Groundwater',
      'Waveney Surface Water',
      'Welland - Tinwell Sluices',
      'Witham and Ancholme',
      'Wye'
    ]
  }
}

module.exports = CalculateChargeSrocTranslator
