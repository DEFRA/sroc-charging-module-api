'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AuthorisedSystemHelper = require('../../support/helpers/authorised_system.helper')
const BillRunHelper = require('../../support/helpers/bill_run.helper')
const DatabaseHelper = require('../../support/helpers/database.helper')
const RegimeHelper = require('../../support/helpers/regime.helper')

// Thing under test
const { GenerateBillRunValidationService } = require('../../../app/services')

describe('Generate Bill Run Validation service', () => {
  let billRun
  let authorisedSystem
  let regime

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
  })

  describe('When a valid bill run ID is supplied', () => {
    beforeEach(async () => {
      billRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id)
    })

    it('returns true', async () => {
      // By setting one of the counts to more than 0 the validator will interpret that as it not being empty. Within
      // the service this would be done properly by adding an actual transaction using CreateTransactionService!
      billRun.debitLineCount = 1

      const result = await GenerateBillRunValidationService.go(billRun)

      expect(result).to.equal(true)
    })
  })

  describe('When an invalid bill run ID is supplied', () => {
    describe('because the bill run status is `pending`', () => {
      it('throws an error', async () => {
        const generatingBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'pending')
        const err = await expect(GenerateBillRunValidationService.go(generatingBillRun)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Summary for bill run ${generatingBillRun.id} is being updated`)
      })
    })

    describe('because the bill run has already been generated', () => {
      it('throws an error', async () => {
        const generatingBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A', 'generated')
        const err = await expect(GenerateBillRunValidationService.go(generatingBillRun)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Summary for bill run ${generatingBillRun.id} has already been generated.`)
      })
    })

    describe('because the bill run is empty', () => {
      it('throws an error', async () => {
        const emptyBillRun = await BillRunHelper.addBillRun(authorisedSystem.id, regime.id, 'A')
        const err = await expect(GenerateBillRunValidationService.go(emptyBillRun)).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Summary for bill run ${emptyBillRun.id} cannot be generated because it has no transactions.`)
      })
    })
  })
})
