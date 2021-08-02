'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper } = require('../../helpers')

// Thing under test
const { NewLicenceHelper } = require('../../helpers')

describe('New Invoice helper', () => {
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('#update method', () => {
    beforeEach(async () => {
      licence = await NewLicenceHelper.add()
    })

    it('adds supplied values to the existing licence', async () => {
      const result = await NewLicenceHelper.update(licence, {
        debitLineCount: 5,
        subjectToMinimumChargeDebitValue: 5000
      })

      expect(result.debitLineCount).to.equal(5)
      expect(result.subjectToMinimumChargeDebitValue).to.equal(5000)
    })
  })
})
