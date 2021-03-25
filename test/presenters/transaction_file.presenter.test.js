'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../support/helpers')

// Thing under test
const { TransactionFilePresenter } = require('../../app/presenters')

describe.only('View Invoice Presenter', () => {
  const data = {
    id: GeneralHelper.uuid4(),
    billRunId: GeneralHelper.uuid4(),
    chargeValue: 772,
    chargeCredit: false,
    createdAt: '2021-03-25T12:05:54.651Z',
    updatedAt: '2021-03-25T12:05:54.651Z',
    createdBy: GeneralHelper.uuid4(),
    regimeId: GeneralHelper.uuid4(),
    ruleset: 'presroc',
    status: 'unbilled',
    transactionDate: '2021-01-01T12:05:54.651Z',
    subjectToMinimumCharge: false,
    minimumChargeAdjustment: false,
    netZeroValueInvoice: false,
    customerReference: 'TH230000222',
    clientId: null,
    region: 'A',
    lineAreaCode: 'ARCA',
    lineDescription: 'Well at Chigley Town Hall',
    chargePeriodStart: '2019-04-01T00:00:00.000Z',
    chargePeriodEnd: '2020-03-31T00:00:00.000Z',
    chargeFinancialYear: null,
    headerAttr1: '2021-12-31T12:05:54.651Z',
    headerAttr2: null,
    headerAttr3: null,
    headerAttr4: null,
    headerAttr5: null,
    headerAttr6: null,
    headerAttr7: null,
    headerAttr8: null,
    headerAttr9: null,
    headerAttr10: null,
    lineAttr1: 'TONY/TF9222/37',
    lineAttr2: '01-APR-2018 - 31-MAR-2019',
    lineAttr3: 'TEST',
    lineAttr4: '1495',
    lineAttr5: '6.22',
    lineAttr6: '3',
    lineAttr7: '1.6',
    lineAttr8: '0.03',
    lineAttr9: 'TEST',
    lineAttr10: 'TEST',
    lineAttr11: null,
    lineAttr12: null,
    lineAttr13: '0',
    lineAttr14: '0',
    lineAttr15: null,
    regimeValue1: 'TONY10',
    regimeValue2: null,
    regimeValue3: '',
    regimeValue4: '310',
    regimeValue5: '365',
    regimeValue6: 'Supported',
    regimeValue7: 'Summer',
    regimeValue8: 'Low',
    regimeValue9: 'false',
    regimeValue10: null,
    regimeValue11: null,
    regimeValue12: 'false',
    regimeValue13: 'Tidal',
    regimeValue14: 'false',
    regimeValue15: 'Anglian',
    regimeValue16: 'false',
    regimeValue17: 'false',
    regimeValue18: null,
    regimeValue19: null,
    regimeValue20: null,
    chargeCalculation: {
      __DecisionID__: GeneralHelper.uuid4(),
      WRLSChargingResponse: {
        chargeValue: 7.72,
        decisionPoints: [Object],
        messages: [],
        sucFactor: 14.95,
        volumeFactor: 3.5865,
        sourceFactor: 3,
        seasonFactor: 1.6,
        lossFactor: 0.03,
        abatementAdjustment: 'S126 x 1.0',
        s127Agreement: null,
        s130Agreement: null,
        eiucSourceFactor: 0,
        eiucFactor: 0
      }
    },
    invoiceId: GeneralHelper.uuid4(),
    licenceId: GeneralHelper.uuid4(),
    fileReference: 'FILE_REF',
    transactionReference: 'TRANSACTION_REF',
    billRunNumber: '12345'
  }

  it('returns the required columns', () => {
    const presenter = new TransactionFilePresenter(data)
    const result = presenter.go()

    // To avoid writing out col01...col43 we generate an array of them
    const expectedFields = []
    for (let fieldNumber = 1; fieldNumber <= 43; fieldNumber++) {
      const paddedNumber = fieldNumber.toString().padStart(2, '0')
      expectedFields.push(`col${paddedNumber}`)
    }

    // This isn't every field but it is the critical ones
    expect(result).to.only.include(expectedFields)
  })

  it('returns the correct values for static fields', () => {
    const presenter = new TransactionFilePresenter(data)
    const result = presenter.go()

    expect(result.col01).to.equal('D')
    expect(result.col07).to.equal('')
    expect(result.col08).to.equal('GBP')
    expect(result.col09).to.equal('')
    expect(result.col11).to.equal('')
    expect(result.col12).to.equal('')
    expect(result.col13).to.equal('')
    expect(result.col14).to.equal('')
    expect(result.col15).to.equal('')
    expect(result.col16).to.equal('')
    expect(result.col17).to.equal('')
    expect(result.col18).to.equal('')
    expect(result.col19).to.equal('')
    expect(result.col21).to.equal('')
    expect(result.col24).to.equal('A')
    expect(result.col25).to.equal('')
    expect(result.col36).to.equal('')
    expect(result.col37).to.equal('')
    expect(result.col40).to.equal('')
    expect(result.col41).to.equal('1')
    expect(result.col42).to.equal('Each')
  })

  it('returns the correct values for dynamic fields', () => {
    const presenter = new TransactionFilePresenter(data)
    const result = presenter.go()

    expect(result.col02).to.equal(data.billRunNumber)
    expect(result.col03).to.equal(data.customerReference)
    expect(result.col06).to.equal(data.transactionReference)
    expect(result.col20).to.equal(data.chargeValue)
    expect(result.col22).to.equal(data.lineAreaCode)
    expect(result.col23).to.equal(data.lineDescription)
    expect(result.col43).to.equal(data.chargeValue)
  })

  it('returns the correct values for col05 (transactionType) when given a credit', () => {
    const presenter = new TransactionFilePresenter({ ...data, chargeCredit: true })
    const result = presenter.go()

    expect(result.col05).to.equal('C')
  })

  it('returns the correct values for col05 (transactionType) when given a debit', () => {
    const presenter = new TransactionFilePresenter({ ...data, chargeCredit: false })
    const result = presenter.go()

    expect(result.col05).to.equal('I')
  })

  it('correctly formats dates', () => {
    const presenter = new TransactionFilePresenter(data)
    const result = presenter.go()

    expect(result.col04).to.equal('01-JAN-2021')
    expect(result.col10).to.equal('31-DEC-2021')
  })

  it('returns correct values when compensation charge and minimum charge adjustment are false', () => {
    const presenter = new TransactionFilePresenter({ ...data, regimeValue17: false, minimumChargeAdjustment: false })
    const result = presenter.go()

    expect(result.col26).to.equal(data.lineAttr1)
    expect(result.col27).to.equal(data.lineAttr2)
    expect(result.col28).to.equal(data.lineAttr3)
    expect(result.col29).to.equal(data.lineAttr4)
    expect(result.col30).to.not.equal('') // We test col30's content in a separate test
    expect(result.col31).to.equal(data.lineAttr6)
    expect(result.col32).to.equal(data.lineAttr7)
    expect(result.col33).to.equal(data.lineAttr8)
    expect(result.col34).to.equal(data.lineAttr9)
    expect(result.col35).to.equal(data.lineAttr10)

    expect(result.col38).to.equal('')
    expect(result.col39).to.equal('')
  })

  it('returns correct values when compensation charge is true', () => {
    const presenter = new TransactionFilePresenter({ ...data, regimeValue17: true, minimumChargeAdjustment: false })
    const result = presenter.go()

    expect(result.col26).to.equal('')
    expect(result.col27).to.equal('')
    expect(result.col28).to.equal('')
    expect(result.col29).to.equal('')
    expect(result.col30).to.equal('')
    expect(result.col31).to.equal('')
    expect(result.col32).to.equal('')
    expect(result.col33).to.equal('')
    expect(result.col34).to.equal('')
    expect(result.col35).to.equal('')

    expect(result.col38).to.equal(data.lineAttr13)
    expect(result.col39).to.equal(data.lineAttr14)
  })

  it('returns correct values when minimum charge adjustment is true', () => {
    const presenter = new TransactionFilePresenter({ ...data, regimeValue17: false, minimumChargeAdjustment: true })
    const result = presenter.go()

    expect(result.col26).to.equal('')
    expect(result.col27).to.equal('')
    expect(result.col28).to.equal('')
    expect(result.col29).to.equal('')
    expect(result.col30).to.equal('')
    expect(result.col31).to.equal('')
    expect(result.col32).to.equal('')
    expect(result.col33).to.equal('')
    expect(result.col34).to.equal('')
    expect(result.col35).to.equal('')

    expect(result.col38).to.equal('')
    expect(result.col39).to.equal('')
  })

  it('returns the correct value for col30', () => {
    const presenter = new TransactionFilePresenter({ ...data, regimeValue17: false, minimumChargeAdjustment: true })
    const result = presenter.go()

    expect(result.col26).to.equal('')
    expect(result.col27).to.equal('')
    expect(result.col28).to.equal('')
    expect(result.col29).to.equal('')
    expect(result.col30).to.equal('')
    expect(result.col31).to.equal('')
    expect(result.col32).to.equal('')
    expect(result.col33).to.equal('')
    expect(result.col34).to.equal('')
    expect(result.col35).to.equal('')

    expect(result.col38).to.equal('')
    expect(result.col39).to.equal('')
  })
})
