'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { GeneralHelper } = require('../support/helpers')

// Thing under test
const { TransactionFileHeaderPresenter } = require('../../app/presenters')

describe('Transaction File Header presenter', () => {
  it('correctly presents the data', () => {
    const data = {
      index: 0,
      region: 'A',
      fileId: 'FILE_ID',
      id: GeneralHelper.uuid4(),
      updatedAt: '2021-01-12T14:41:10.511Z'
    }

    const testPresenter = new TransactionFileHeaderPresenter(data)
    const result = testPresenter.go()

    expect(result.col01).to.equal('H')
    expect(result.col02).to.equal('0000000')
    expect(result.col03).to.equal('NAL')
    expect(result.col04).to.equal(data.region)
    expect(result.col05).to.equal('I')
    expect(result.col06).to.equal(data.fileId)
    expect(result.col07).to.equal(data.id)
    expect(result.col08).to.equal('12-JAN-2021')
  })
})
