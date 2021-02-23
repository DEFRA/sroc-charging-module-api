'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../support/helpers')

// Thing under test
const { InvoicePresenter } = require('../../app/presenters')

describe('Invoice Presenter', () => {
  const data = {
    id: GeneralHelper.uuid4(),
    billRunId: GeneralHelper.uuid4(),
    customerReference: 'CUSTOMER_REFERENCE',
    financialYear: 2018,
    creditLineCount: 2,
    creditLineValue: 4186,
    debitLineCount: 0,
    debitLineValue: 0,
    zeroLineCount: 0,
    deminimisInvoice: false,
    zeroValueInvoice: false,
    minimumChargeInvoice: false,
    transactionReference: null,
    licences: [
      {
        id: GeneralHelper.uuid4(),
        licenceNumber: 'LICENCE_NUMBER',
        creditLineCount: 0,
        creditLineValue: 4186,
        debitLineCount: 2,
        debitLineValue: 0,
        zeroLineCount: 0,
        subjectToMinimumChargeCount: 0,
        netTotal: 4186,
        transactions: [
          {
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
        ]
      }
    ]
  }

  it("returns the 'invoice' details", () => {
    const presenter = new InvoicePresenter(data)
    const result = presenter.go()

    // This isn't every field but it is the critical ones. Includes `netTotal` which doesn't come from the DB
    expect(result).to.include([
      'id',
      'billRunId',
      'customerReference',
      'financialYear',
      'deminimisInvoice',
      'zeroValueInvoice',
      'minimumChargeInvoice',
      'transactionReference',
      'netTotal'
    ])
  })

  it("returns the 'licences' linked to the 'invoice'", () => {
    const presenter = new InvoicePresenter(data)
    const result = presenter.go()

    expect(result.licences).to.be.an.array()
    expect(result.licences[0]).to.include([
      'id',
      'licenceNumber',
      'netTotal'
    ])
  })

  it("returns the 'transactions' linked to the 'licences' linked to the 'invoice'", () => {
    const presenter = new InvoicePresenter(data)
    const result = presenter.go()

    expect(result.licences[0].transactions).to.be.an.array()
    // This isn't every field but it is the critical ones. Includes `credit` and `newLicence` to confirm we do rename
    // fields if needed
    expect(result.licences[0].transactions[0]).to.include([
      'id',
      'clientId',
      'chargeValue',
      'credit',
      'status',
      'newLicence',
      'minimumChargeAdjustment',
      'chargeCalculation'
    ])
  })
})
