'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../support/helpers')

// Thing under test
const { TransactionFileFooterPresenter } = require('../../app/presenters')

describe('Transaction File Footer Presenter', () => {
  const data = {
    id: GeneralHelper.uuid4(),
    createdAt: '2021-01-01 12:05:54.569348+00',
    updatedAt: '2021-01-01 12:05:54.569348+00',
    billRunNumber: 10002,
    region: 'W',
    status: 'approved',
    creditNoteCount: 0,
    creditNoteValue: 0,
    invoiceCount: 1,
    invoiceValue: 43056,
    netTotal: 43056,
    transactionFileReference: 'ABCDEF',
    invoices: []
  }

  // it('returns the required columns', () => {
  //   const presenter = new TransactionFileFooterPresenter(data)
  //   const result = presenter.go()

  //   // To avoid writing out col01...col08 we generate an array of them
  //   const expectedFields = []
  //   for (let fieldNumber = 1; fieldNumber <= 8; fieldNumber++) {
  //     const paddedNumber = fieldNumber.toString().padStart(2, '0')
  //     expectedFields.push(`col${paddedNumber}`)
  //   }

  //   expect(result).to.only.include(expectedFields)
  // })

  // it('returns the correct values for static fields', () => {
  //   const presenter = new TransactionFileFooterPresenter(data)
  //   const result = presenter.go()

  //   expect(result.col01).to.equal('H')
  //   expect(result.col03).to.equal('NAL')
  //   expect(result.col05).to.equal('I')
  // })

  // it('returns the correct values for dynamic fields', () => {
  //   const presenter = new TransactionFileFooterPresenter(data)
  //   const result = presenter.go()

  //   expect(result.col02).to.equal(data.billRunNumber)
  //   expect(result.col04).to.equal(data.region)
  //   expect(result.col06).to.equal(data.fileId)
  //   expect(result.col07).to.equal(data.id)
  // })

  // it('correctly formats dates', () => {
  //   const presenter = new TransactionFileFooterPresenter(data)
  //   const result = presenter.go()

  //   expect(result.col08).to.equal('01-JAN-2021')
  // })
})
