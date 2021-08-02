'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper } = require('../../helpers')
const { LicenceModel } = require('../../../../app/models')

// Thing under test
const { NewTransactionHelper } = require('../../helpers')

describe('New Transaction helper', () => {
  let transaction

  beforeEach(async () => {
    await DatabaseHelper.clean()

    transaction = await NewTransactionHelper.add()
  })

  describe('#add method', () => {
    it('updates the parent licence', async () => {
      const result = await LicenceModel.query().findById(transaction.licenceId)

      expect(result.debitLineCount).to.equal(1)
      expect(result.debitLineValue).to.equal(transaction.chargeValue)
    })
  })
})
