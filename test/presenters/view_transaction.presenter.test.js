'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GeneralHelper = require('../support/helpers/general.helper.js')

// Thing under test
const ViewTransactionPresenter = require('../../app/presenters/view_transaction.presenter.js')

describe('View Transaction Presenter', () => {
  const baseData = {
    id: GeneralHelper.uuid4(),
    clientId: null,
    chargeValue: 2093,
    chargeCredit: false,
    subjectToMinimumCharge: false,
    minimumChargeAdjustment: false,
    lineDescription: 'Well at Chigley Town Hall',
    chargePeriodStart: '2019-04-01',
    chargePeriodEnd: '2020-03-31',
    regimeValue17: 'true',
    rebilledTransactionId: GeneralHelper.uuid4(),
    chargeCalculation: '{"__DecisionID__":"91a711c1-2dbb-47fe-ae8e-505da38432d70","WRLSChargingResponse":{"chargeValue":7.72,"decisionPoints":{"sourceFactor":10.7595,"seasonFactor":17.2152,"lossFactor":0.5164559999999999,"volumeFactor":3.5865,"abatementAdjustment":7.721017199999999,"s127Agreement":7.721017199999999,"s130Agreement":7.721017199999999,"secondPartCharge":false,"waterUndertaker":false,"eiucFactor":0,"compensationCharge":false,"eiucSourceFactor":0,"sucFactor":7.721017199999999},"messages":[],"sucFactor":14.95,"volumeFactor":3.5865,"sourceFactor":3,"seasonFactor":1.6,"lossFactor":0.03,"abatementAdjustment":"S126 x 1.0","s127Agreement":null,"s130Agreement":null,"eiucSourceFactor":0,"eiucFactor":0}}'
  }

  describe('if the ruleset is `presroc`', () => {
    const presrocData = {
      ...baseData,
      // Ruleset is not normally part of the transaction record but we expect it to be passed in to the presenter
      ruleset: 'presroc',
      lineAttr9: 'S130S x 0.833',
      lineAttr10: 'S127 x 0.5'
    }

    it('returns `subjectToMinimumCharge`', () => {
      const presenter = new ViewTransactionPresenter(presrocData)
      const result = presenter.go()

      expect(result).to.include('subjectToMinimumCharge')
    })

    it('returns `minimumChargeAdjustment`', () => {
      const presenter = new ViewTransactionPresenter(presrocData)
      const result = presenter.go()

      expect(result).to.include('minimumChargeAdjustment')
    })

    it('does not return `winterOnlyFactor`', () => {
      const presenter = new ViewTransactionPresenter(presrocData)
      const result = presenter.go()

      expect(result).to.not.include('winterOnlyFactor')
    })

    it('correctly presents the data', () => {
      const presenter = new ViewTransactionPresenter(presrocData)
      const result = presenter.go()

      expect(result.id).to.equal(baseData.id)
      expect(result.clientId).to.equal(baseData.clientId)
      expect(result.chargeValue).to.equal(baseData.chargeValue)
      expect(result.credit).to.equal(baseData.chargeCredit)
      expect(result.subjectToMinimumCharge).to.equal(baseData.subjectToMinimumCharge)
      expect(result.minimumChargeAdjustment).to.equal(baseData.minimumChargeAdjustment)
      expect(result.lineDescription).to.equal(baseData.lineDescription)
      expect(result.periodStart).to.equal(baseData.chargePeriodStart)
      expect(result.periodEnd).to.equal(baseData.chargePeriodEnd)
      expect(result.compensationCharge).to.be.true()
      expect(result.rebilledTransactionId).to.equal(baseData.rebilledTransactionId)
      expect(result.calculation).to.equal(baseData.chargeCalculation)
      expect(result.section130Factor).to.equal(0.833)
      expect(result.section127Factor).to.equal(0.5)
    })
  })

  describe('if the ruleset is `sroc`', () => {
    const srocData = {
      ...baseData,
      // Ruleset is not normally part of the transaction record but we expect it to be passed in to the presenter
      ruleset: 'sroc',
      lineAttr9: 0.833,
      lineAttr10: 0.5,
      lineAttr12: 0.5
    }

    it('does not return `subjectToMinimumCharge`', () => {
      const presenter = new ViewTransactionPresenter(srocData)
      const result = presenter.go()

      expect(result).to.not.include('subjectToMinimumCharge')
    })

    it('does not return `minimumChargeAdjustment`', () => {
      const presenter = new ViewTransactionPresenter(srocData)
      const result = presenter.go()

      expect(result).to.not.include('minimumChargeAdjustment')
    })

    it('returns `winterOnlyFactor`', () => {
      const presenter = new ViewTransactionPresenter(srocData)
      const result = presenter.go()

      expect(result).to.include('winterOnlyFactor')
    })

    it('correctly presents the data', () => {
      const presenter = new ViewTransactionPresenter(srocData)
      const result = presenter.go()

      expect(result.id).to.equal(baseData.id)
      expect(result.clientId).to.equal(baseData.clientId)
      expect(result.chargeValue).to.equal(baseData.chargeValue)
      expect(result.credit).to.equal(baseData.chargeCredit)
      expect(result.lineDescription).to.equal(baseData.lineDescription)
      expect(result.periodStart).to.equal(baseData.chargePeriodStart)
      expect(result.periodEnd).to.equal(baseData.chargePeriodEnd)
      expect(result.compensationCharge).to.be.true()
      expect(result.rebilledTransactionId).to.equal(baseData.rebilledTransactionId)
      expect(result.calculation).to.equal(baseData.chargeCalculation)
      expect(result.section130Factor).to.equal(0.833)
      expect(result.section127Factor).to.equal(0.5)
      expect(result.winterOnlyFactor).to.equal(0.5)
    })
  })
})
