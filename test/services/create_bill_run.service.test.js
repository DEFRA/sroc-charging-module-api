'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { AuthorisedSystemHelper, DatabaseHelper, RegimeHelper } = require('../support/helpers')
const BillRunModel = require('../../app/models/bill_run.model')
const { ValidationError } = require('joi')

// Thing under test
const { CreateBillRunService } = require('../../app/services')

describe('Create Bill Run service', () => {
  const payload = {
    region: 'A'
  }

  let authorisedSystem
  let regime

  beforeEach(async () => {
    await DatabaseHelper.clean()
    regime = await RegimeHelper.addRegime('ice', 'water')
    authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
  })

  describe('When the data is valid', () => {
    it('creates a bill', async () => {
      const result = await CreateBillRunService.go(payload, authorisedSystem, regime)

      expect(result instanceof BillRunModel).to.equal(true)
      expect(result.id).to.exist()
    })

    it("records the 'regime' it's for", async () => {
      const result = await CreateBillRunService.go(payload, authorisedSystem, regime)

      expect(result.regimeId).to.equal(regime.id)
    })

    it("records who it was 'created_by'", async () => {
      const result = await CreateBillRunService.go(payload, authorisedSystem, regime)

      expect(result.createdBy).to.equal(authorisedSystem.id)
    })

    it("defaults 'status' to 'initialised", async () => {
      const result = await CreateBillRunService.go(payload, authorisedSystem, regime)

      expect(result.status).to.equal('initialised')
    })
  })

  describe('When the data is invalid', () => {
    describe("because 'payload' is invalid", () => {
      const invalidPayload = {
        region: 'Z'
      }

      it('throws an error', async () => {
        const err = await expect(CreateBillRunService.go(invalidPayload, authorisedSystem, regime)).to.reject(ValidationError)

        expect(err).to.be.an.error()
      })
    })

    describe("because 'authorisedSystem' is not specified", () => {
      it('throws an error', async () => {
        const err = await expect(CreateBillRunService.go(payload, null, regime)).to.reject(TypeError)

        expect(err).to.be.an.error()
      })
    })

    describe("because 'regime' is not specified", () => {
      it('throws an error', async () => {
        const err = await expect(CreateBillRunService.go(payload, authorisedSystem)).to.reject(TypeError)

        expect(err).to.be.an.error()
      })
    })
  })
})
