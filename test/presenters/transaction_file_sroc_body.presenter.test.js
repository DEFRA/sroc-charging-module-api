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
  // Note that generic fields hold true/false values as text, not boolean
  const data = {
    index: 1,
    customerReference: 'CUSTOMER_REF',
    chargeCredit: false,
    transactionReference: 'TRANSACTION_REF',
    chargeValue: 772,
    lineAreaCode: 'ARCA',
    lineDescription: 'Well at Chigley Town Hall',
    lineAttr1: 'LINE_ATTR_1',
    lineAttr3: 'LINE_ATTR_3',
    lineAttr4: 'LINE_ATTR_4',
    headerAttr4: 'HEADER_ATTR_4',
    regimeValue18: 'REGIME_VALUE_18',
    headerAttr9: 'HEADER_ATTR_9',
    // Reductions, col33
    headerAttr2: '1',
    lineAttr12: 'false',
    regimeValue9: 'false',
    regimeValue11: '1',
    regimeValue12: 'false',
    // Supported source, col34
    headerAttr5: 'true',
    lineAttr11: 15000,
    headerAttr6: 'SUPPORTED_SOURCE_NAME',
    // Volume, col35
    regimeValue16: 'true',
    regimeValue20: 123.4,
    headerAttr3: 567.8,
    // waterCompany, col36
    headerAttr7: 'true',
    headerAttr10: 12345,
    // Compensation charge %, col37
    // Note that we set compensation charge to 'false' as many fields are empty when this is 'true'
    regimeValue17: 'false',
    regimeValue2: 50,
    regimeValue15: 'REGIONAL_CHARGING_AREA'
  }

  it('returns the required columns', () => {
    const presenter = new TransactionFileSrocBodyPresenter(data)
    const result = presenter.go()

    const expectedFields = PresenterHelper.generateNumberedColumns(43)

    expect(result).to.only.include(expectedFields)
  })

  describe('for static fields', () => {
    it('returns the correct values', () => {
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
      expect(result.col24).to.equal('AT')
      expect(result.col25).to.equal('')
      expect(result.col38).to.equal('')
      expect(result.col39).to.equal('')
      expect(result.col40).to.equal('')
      expect(result.col41).to.equal('1')
      expect(result.col42).to.equal('Each')
    })
  })

  describe('for dynamic fields', () => {
    it('returns the correct values', () => {
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
  })

  describe('for col05 (transactionType)', () => {
    it('returns the correct values when given a credit', () => {
      const presenter = new TransactionFileSrocBodyPresenter({ ...data, creditLineValue: 500, debitLineValue: 100 })
      const result = presenter.go()

      expect(result.col05).to.equal('C')
    })

    it('returns the correct values when given a debit', () => {
      const presenter = new TransactionFileSrocBodyPresenter({ ...data, debitLineValue: 500, creditLineValue: 100 })
      const result = presenter.go()

      expect(result.col05).to.equal('I')
    })
  })

  describe('for col04 and col10 (date columns)', () => {
    it('correctly formats dates', () => {
      const presenter = new TransactionFileSrocBodyPresenter(data)
      const result = presenter.go()

      const basePresenter = new BasePresenter()
      const date = basePresenter._formatDate(new Date())

      expect(result.col04).to.equal(date)
      expect(result.col10).to.equal(date)
    })
  })

  describe('for cols that are dependent on compensation charge', () => {
    it('returns expected values when compensation charge is false', () => {
      const presenter = new TransactionFileSrocBodyPresenter({
        ...data,
        regimeValue17: 'false',
        // We set a reduction to ensure the reductions col is not empty
        lineAttr12: 'true'
      })

      const result = presenter.go()

      expect(result.col26).to.equal(data.lineAttr1)
      expect(result.col28).to.equal(data.lineAttr2)
      expect(result.col29).to.equal(data.lineAttr3)
      expect(result.col30).to.equal(data.headerAttr4)
      expect(result.col31).to.equal(data.regimeValue18)
      expect(result.col32).to.equal(data.headerAttr9)
      expect(result.col33).to.not.equal('') // This column is checked in a separate test
      expect(result.col34).to.not.equal('') // This column is checked in a separate test
      expect(result.col35).to.not.equal('') // This column is checked in a separate test
      expect(result.col36).to.not.equal('') // This column is checked in a separate test

      expect(result.col37).to.equal('')
    })

    it('returns expected values when compensation charge is true', () => {
      const presenter = new TransactionFileSrocBodyPresenter({
        ...data,
        regimeValue17: 'true'
      })

      const result = presenter.go()

      expect(result.col26).to.equal('')
      expect(result.col28).to.equal('')
      expect(result.col29).to.equal('')
      expect(result.col30).to.equal('')
      expect(result.col31).to.equal('')
      expect(result.col32).to.equal('')
      expect(result.col33).to.equal('')
      expect(result.col34).to.equal('')
      expect(result.col35).to.equal('')
      expect(result.col36).to.equal('')

      expect(result.col37).to.not.equal('') // This column is checked in a separate test
    })
  })

  describe('for col33 (reductions list)', () => {
    it('returns a populated list if reductions apply', () => {
      const presenter = new TransactionFileSrocBodyPresenter({
        ...data,
        regimeValue17: 'false',
        headerAttr2: 0.5,
        lineAttr12: 'true',
        regimeValue9: 'true',
        regimeValue11: 0.5,
        regimeValue12: 'true'
      })

      const result = presenter.go()

      expect(result.col33).to.equal('Aggregate, Winter Only Discount, CRT Discount, Abatement of Charges, Two-Part Tariff')
    })

    it('returns an empty list if no reductions apply', () => {
      const presenter = new TransactionFileSrocBodyPresenter({
        ...data,
        regimeValue17: 'false'
      })

      const result = presenter.go()

      expect(result.col33).to.equal('')
    })
  })

  describe('for col34 (supported source)', () => {
    it('returns the correct data if supported source is true', () => {
      const presenter = new TransactionFileSrocBodyPresenter({
        ...data,
        regimeValue17: 'false'
      })

      const result = presenter.go()

      expect(result.col34).to.equal('15000, SUPPORTED_SOURCE_NAME')
    })

    it('returns blank if supported source is false', () => {
      const presenter = new TransactionFileSrocBodyPresenter({
        ...data,
        regimeValue17: 'false',
        headerAttr5: 'false'
      })

      const result = presenter.go()

      expect(result.col34).to.equal('')
    })
  })

  describe('for col35 (volume)', () => {
    it('returns the correct data if two part tariff is true', () => {
      const presenter = new TransactionFileSrocBodyPresenter({
        ...data,
        regimeValue17: 'false'
      })

      const result = presenter.go()

      expect(result.col35).to.equal('123.4 / 567.8 Ml')
    })

    it('returns blank if two part tariff is false', () => {
      const presenter = new TransactionFileSrocBodyPresenter({
        ...data,
        regimeValue17: 'false',
        regimeValue16: 'false'
      })

      const result = presenter.go()

      expect(result.col35).to.equal('')
    })
  })

  describe('for col36 (water company)', () => {
    it('returns the correct data if water company charge is true', () => {
      const presenter = new TransactionFileSrocBodyPresenter({
        ...data,
        regimeValue17: 'false'
      })

      const result = presenter.go()

      expect(result.col36).to.equal(data.headerAttr10)
    })

    it('returns blank if water company charge is false', () => {
      const presenter = new TransactionFileSrocBodyPresenter({
        ...data,
        regimeValue17: 'false',
        headerAttr7: 'false'
      })

      const result = presenter.go()

      expect(result.col36).to.equal('')
    })
  })

  describe('for col37 (compensation charge)', () => {
    it('returns the correct data if water company charge is true', () => {
      const presenter = new TransactionFileSrocBodyPresenter({
        ...data,
        // Note that compensation charge is true here unlike the other col tests
        regimeValue17: 'true'
      })

      const result = presenter.go()

      expect(result.col37).to.equal('50% (REGIONAL_CHARGING_AREA)')
    })
  })
})
