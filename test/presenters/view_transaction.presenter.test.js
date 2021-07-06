// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import GeneralHelper from '../support/helpers/general.helper'

// Thing under test
import ViewTransactionPresenter from '../../app/presenters/view_transaction.presenter.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

describe('View Transaction Presenter', () => {
  const data = {
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

  it('returns the required columns', () => {
    const presenter = new ViewTransactionPresenter(data)
    const result = presenter.go()

    expect(result).to.include([
      'id',
      'clientId',
      'chargeValue',
      'credit',
      'subjectToMinimumCharge',
      'minimumChargeAdjustment',
      'lineDescription',
      'periodStart',
      'periodEnd',
      'compensationCharge',
      'rebilledTransactionId',
      'calculation'
    ])
  })

  it('correctly presents the data', () => {
    const presenter = new ViewTransactionPresenter(data)
    const result = presenter.go()

    expect(result.id).to.equal(data.id)
    expect(result.clientId).to.equal(data.clientId)
    expect(result.chargeValue).to.equal(data.chargeValue)
    expect(result.credit).to.equal(data.chargeCredit)
    expect(result.subjectToMinimumCharge).to.equal(data.subjectToMinimumCharge)
    expect(result.minimumChargeAdjustment).to.equal(data.minimumChargeAdjustment)
    expect(result.lineDescription).to.equal(data.lineDescription)
    expect(result.periodStart).to.equal(data.chargePeriodStart)
    expect(result.periodEnd).to.equal(data.chargePeriodEnd)
    expect(result.compensationCharge).to.be.true()
    expect(result.rebilledTransactionId).to.equal(data.rebilledTransactionId)
    expect(result.calculation).to.equal(data.chargeCalculation)
  })
})
