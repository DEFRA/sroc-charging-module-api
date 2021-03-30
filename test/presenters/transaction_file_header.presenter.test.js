'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { TransactionFileHeadPresenter } = require('../../app/presenters')

describe.only('Transaction File Head presenter', () => {
  const data = {
    index: 0,
    region: 'A',
    fileReference: 'nalri50003',
    billRunNumber: 10004,
    billRunUpdatedAt: '2021-01-12T14:41:10.511Z'
  }

  it('returns the required columns', () => {
    const testPresenter = new TransactionFileHeadPresenter(data)
    const result = testPresenter.go()

    // To avoid writing out col01...col08 we generate an array of them
    const expectedFields = []
    for (let fieldNumber = 1; fieldNumber <= 8; fieldNumber++) {
      const paddedNumber = fieldNumber.toString().padStart(2, '0')
      expectedFields.push(`col${paddedNumber}`)
    }

    expect(result).to.only.include(expectedFields)
  })

  it('correctly presents the data', () => {
    const testPresenter = new TransactionFileHeadPresenter(data)
    const result = testPresenter.go()

    expect(result.col01).to.equal('H')
    expect(result.col02).to.equal('0000000')
    expect(result.col03).to.equal('NAL')
    expect(result.col04).to.equal(data.region)
    expect(result.col05).to.equal('I')
    expect(result.col06).to.equal('50003')
    expect(result.col07).to.equal(data.billRunNumber)
    expect(result.col08).to.equal('12-JAN-2021')
  })
})
