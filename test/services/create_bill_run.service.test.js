// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'
import SequenceCounterHelper from '../support/helpers/sequence_counter.helper.js'

// Additional dependencies needed
import BillRunModel from '../../app/models/bill_run.model.js'
import { ValidationError } from 'joi'

// Thing under test
import CreateBillRunService from '../../app/services/create_bill_run.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

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
    await SequenceCounterHelper.addSequenceCounter(regime.id, payload.region)
  })

  describe('When the data is valid', () => {
    let result

    beforeEach(async () => {
      const billRun = await CreateBillRunService.go(payload, authorisedSystem, regime)
      result = await BillRunModel.query().findById(billRun.billRun.id)
    })

    it('creates a bill', async () => {
      expect(result.id).to.exist()
    })

    it("records the 'regime' it's for", async () => {
      expect(result.regimeId).to.equal(regime.id)
    })

    it("records who it was 'created_by'", async () => {
      expect(result.createdBy).to.equal(authorisedSystem.id)
    })

    it("defaults 'status' to 'initialised", async () => {
      expect(result.status).to.equal('initialised')
    })

    it('records the bill run number', async () => {
      // Bill run number column defaults to 10000 so the first number retrieved will be 10001
      expect(result.billRunNumber).to.equal(10001)
    })
  })

  describe('When the data is invalid', () => {
    describe("because the 'payload'", () => {
      describe('contains an unrecognised region', () => {
        const invalidPayload = {
          region: 'Z'
        }

        it('throws an error', async () => {
          const err = await expect(CreateBillRunService.go(invalidPayload, authorisedSystem, regime)).to.reject(ValidationError)

          expect(err).to.be.an.error()
        })
      })

      describe('contains an empty region', () => {
        const invalidPayload = {
          region: ''
        }

        it('throws an error', async () => {
          const err = await expect(CreateBillRunService.go(invalidPayload, authorisedSystem, regime)).to.reject(ValidationError)

          expect(err).to.be.an.error()
        })
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
