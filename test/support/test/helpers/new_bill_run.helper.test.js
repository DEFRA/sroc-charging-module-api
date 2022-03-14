'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../helpers/database.helper.js')

// Thing under test
const NewBillRunHelper = require('../../helpers/new_bill_run.helper.js')

describe('New Bill Run helper', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('#update method', () => {
    beforeEach(async () => {
      billRun = await NewBillRunHelper.create(null, null, { billRunNumber: 50000 })
    })

    it('adds supplied numbers to the existing bill run values', async () => {
      const result = await NewBillRunHelper.update(billRun, {
        invoiceCount: 5,
        invoiceValue: 5000
      })

      expect(result.invoiceCount).to.equal(5)
      expect(result.invoiceValue).to.equal(5000)
    })

    it('replaces existing bill run strings', async () => {
      const result = await NewBillRunHelper.update(billRun, {
        status: 'generated'
      })

      expect(result.status).to.equal('generated')
    })

    it('replaces bill run number', async () => {
      const result = await NewBillRunHelper.update(billRun, {
        billRunNumber: 10000
      })

      expect(result.billRunNumber).to.equal(10000)
    })
  })
})
