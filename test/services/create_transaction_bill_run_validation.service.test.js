'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { BillRunHelper, DatabaseHelper, GeneralHelper } = require('../support/helpers')

// Thing under test
const { CreateTransactionBillRunValidationService } = require('../../app/services')

describe('Create Transaction Bill Run Validation service', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
  })

  describe("When the 'bill run' is valid", () => {
    it('returns nothing and throws no error', async () => {
      await expect(CreateTransactionBillRunValidationService.go(billRun, billRun.region)).to.not.reject()
    })
  })

  describe("When the 'bill run' is invalid", () => {
    describe("because it's region and the requested transaction's region do not match", () => {
      it('throws an error', async () => {
        const region = 'W'
        const err = await expect(CreateTransactionBillRunValidationService.go(billRun, region)).to.reject(Error)

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(
          `Bill run ${billRun.id} is for region ${billRun.region} but transaction is for region ${region}.`
        )
      })
    })
  })

  describe("When the 'region' is invalid", () => {
    describe("because it's empty", () => {
      it('throws an error', async () => {
        const err = await expect(CreateTransactionBillRunValidationService.go(billRun)).to.reject(Error)

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(
          `Bill run ${billRun.id} is for region ${billRun.region} but transaction is for region undefined.`
        )
      })
    })
  })
})
