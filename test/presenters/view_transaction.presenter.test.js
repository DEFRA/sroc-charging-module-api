'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../support/helpers')

// Thing under test
const { ViewTransactionPresenter } = require('../../app/presenters')

describe('View Transaction Presenter', () => {
  const data = {
    id: GeneralHelper.uuid4(),
    clientId: null,
    chargeValue: 2093,
    chargeCredit: false,
    status: 'unbilled',
    subjectToMinimumCharge: false,
    minimumChargeAdjustment: false,
    lineDescription: 'Well at Chigley Town Hall',
    chargePeriodStart: '2019-04-01',
    chargePeriodEnd: '2020-03-31',
    regimeValue17: 'false',
    chargeCalculation: '{"__DecisionID__":"91a711c1-2dbb-47fe-ae8e-505da38432d70","WRLSChargingResponse":{"chargeValue":7.72,"decisionPoints":{"sourceFactor":10.7595,"seasonFactor":17.2152,"lossFactor":0.5164559999999999,"volumeFactor":3.5865,"abatementAdjustment":7.721017199999999,"s127Agreement":7.721017199999999,"s130Agreement":7.721017199999999,"secondPartCharge":false,"waterUndertaker":false,"eiucFactor":0,"compensationCharge":false,"eiucSourceFactor":0,"sucFactor":7.721017199999999},"messages":[],"sucFactor":14.95,"volumeFactor":3.5865,"sourceFactor":3,"seasonFactor":1.6,"lossFactor":0.03,"abatementAdjustment":"S126 x 1.0","s127Agreement":null,"s130Agreement":null,"eiucSourceFactor":0,"eiucFactor":0}}'
  }

  it("returns the 'transaction' details", () => {
    const presenter = new ViewTransactionPresenter(data)
    const result = presenter.go()

    // This isn't every field but it is the critical ones
    expect(result).to.include([
      'id',
      'clientId',
      'chargeValue',
      'credit',
      'status',
      'subjectToMinimumCharge',
      'minimumChargeAdjustment',
      'calculation'
    ])
  })
})
