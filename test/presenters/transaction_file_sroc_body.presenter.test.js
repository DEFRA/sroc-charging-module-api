'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

const { BasePresenter } = require('../../app/presenters')

const { PresenterHelper } = require('../support/helpers')

// Thing under test
const { TransactionFileSrocBodyPresenter } = require('../../app/presenters')

describe('Transaction File Sroc Body Presenter', () => {
  const data = {
    index: 1,
    customerReference: 'CUSTOMER_REF',
    transactionDate: Date.now(),
    chargeCredit: false,
    transactionReference: 'TRANSACTION_REF',
    headerAttr1: Date.now(),
    chargeValue: 772,
    lineAreaCode: 'ARCA',
    lineDescription: 'Well at Chigley Town Hall',
    lineAttr1: 'LINE_ATTR_1',
    lineAttr2: '01-APR-2020 - 31-MAR-2021',
    lineAttr3: 'TEST',
    lineAttr4: '1234',
    lineAttr5: '1.23',
    lineAttr6: '123',
    lineAttr7: '2.34',
    lineAttr8: '3.45',
    lineAttr9: 'TEST',
    lineAttr10: 'TEST',
    lineAttr13: '0',
    lineAttr14: '0',
    // Note that the generic field regimeValue17 stores this as a string, not a boolean
    regimeValue17: 'false',
    minimumChargeAdjustment: false
  }

  it('returns the required columns', () => {
    const presenter = new TransactionFileSrocBodyPresenter(data)
    const result = presenter.go()

    const expectedFields = PresenterHelper.generateNumberedColumns(43)

    expect(result).to.only.include(expectedFields)
  })

  it('returns the correct values for static fields', () => {
    const presenter = new TransactionFileSrocBodyPresenter(data)
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
    const presenter = new TransactionFileSrocBodyPresenter(data)
    const result = presenter.go()

    expect(result.col02).to.equal('0000001')
    expect(result.col03).to.equal(data.customerReference)
    expect(result.col06).to.equal(data.transactionReference)
    expect(result.col20).to.equal(data.chargeValue)
    expect(result.col22).to.equal(data.lineAreaCode)
    expect(result.col23).to.equal(data.lineDescription)
    expect(result.col43).to.equal(data.chargeValue)
  })

  it('returns the correct values for col05 (transactionType) when given a credit', () => {
    const presenter = new TransactionFileSrocBodyPresenter({ ...data, creditLineValue: 500, debitLineValue: 100 })
    const result = presenter.go()

    expect(result.col05).to.equal('C')
  })

  it('returns the correct values for col05 (transactionType) when given a debit', () => {
    const presenter = new TransactionFileSrocBodyPresenter({ ...data, debitLineValue: 500, creditLineValue: 100 })
    const result = presenter.go()

    expect(result.col05).to.equal('I')
  })

  it('correctly formats dates', () => {
    const presenter = new TransactionFileSrocBodyPresenter(data)
    const result = presenter.go()

    const basePresenter = new BasePresenter()
    const date = basePresenter._formatDate(new Date())

    expect(result.col04).to.equal(date)
    expect(result.col10).to.equal(date)
  })

  it('returns correct values when compensation charge and minimum charge adjustment are false', () => {
    const presenter = new TransactionFileSrocBodyPresenter({
      ...data,
      regimeValue17: 'false',
      minimumChargeAdjustment: false
    })

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
    const presenter = new TransactionFileSrocBodyPresenter({
      ...data,
      regimeValue17: 'true',
      minimumChargeAdjustment: false
    })

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
    // regimeValue17 is null for minimum charge transactions
    const presenter = new TransactionFileSrocBodyPresenter({
      ...data,
      regimeValue17: null,
      minimumChargeAdjustment: true
    })

    const result = presenter.go()

    expect(result.col26).to.equal(data.lineAttr1)
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
    const presenter = new TransactionFileSrocBodyPresenter({
      ...data,
      regimeValue17: 'false',
      minimumChargeAdjustment: false
    })

    const result = presenter.go()

    expect(result.col30).to.equal('1.23 Ml')
  })
})
