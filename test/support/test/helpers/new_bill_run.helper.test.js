'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper } = require('../../helpers')

// Thing under test
const { NewBillRunHelper } = require('../../helpers')

describe('New Bill Run helper', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('#update method', () => {
    beforeEach(async () => {
      billRun = await NewBillRunHelper.add()
    })

    it('adds supplied values to the existing bill run', async () => {
      const result = await NewBillRunHelper.update(billRun, {
        invoiceCount: 5,
        invoiceValue: 5000
      })

      expect(result.invoiceCount).to.equal(5)
      expect(result.invoiceValue).to.equal(5000)
    })
  })
})