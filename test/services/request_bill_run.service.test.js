'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { BillRunHelper, DatabaseHelper, GeneralHelper, RegimeHelper } = require('../support/helpers')

// Thing under test
const { RequestBillRunService } = require('../../app/services')

describe('Request bill run service', () => {
  let regime
  let billRun

  const billRunPath = id => {
    return `/test/wrls/bill-runs/${id}`
  }

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe("When the request is 'bill run' related", () => {
    describe("and is for a valid 'bill run'", () => {
      beforeEach(async () => {
        regime = await RegimeHelper.addRegime('wrls', 'WRLS')
        billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), regime.id)
      })

      it('returns the matching bill run', async () => {
        const result = await RequestBillRunService.go(billRunPath(billRun.id), 'get', regime, billRun.id)

        expect(result.id).to.equal(billRun.id)
      })

      describe('that can be edited', () => {
        it('returns the matching bill run', async () => {
          const result = await RequestBillRunService.go(billRunPath(billRun.id), 'post', regime, billRun.id)

          expect(result.id).to.equal(billRun.id)
        })
      })
    })

    describe("but is for an invalid 'bill run'", () => {
      describe('because no matching bill run exists', () => {
        it('throws an error', async () => {
          const unknownBillRunId = GeneralHelper.uuid4()
          const err = await expect(
            RequestBillRunService.go(billRunPath(unknownBillRunId), 'get', regime, unknownBillRunId)
          ).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
        })
      })

      describe("because the 'bill run' requested is not for the 'regime' requested", () => {
        beforeEach(async () => {
          billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), regime.id)
        })

        it('throws an error', async () => {
          const requestedRegime = {
            id: GeneralHelper.uuid4(),
            slug: 'notme'
          }

          const err = await expect(
            RequestBillRunService.go(billRunPath(billRun.id), 'get', requestedRegime, billRun.id)
          ).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message)
            .to
            .equal(`Bill run ${billRun.id} is not linked to regime ${requestedRegime.slug}.`)
        })
      })

      describe('because the request involves making a change to the bill run', () => {
        describe("but the 'bill run' is not editable", () => {
          beforeEach(async () => {
            billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), regime.id, 'A', 'billed')
          })

          it('throws an error', async () => {
            const err = await expect(
              RequestBillRunService.go(billRunPath(billRun.id), 'patch', regime, billRun.id)
            ).to.reject()

            expect(err).to.be.an.error()
            expect(err.output.payload.message)
              .to
              .equal(`Bill run ${billRun.id} cannot be edited because its status is ${billRun.status}.`)
          })
        })
      })
    })
  })

  describe("When the request isn't 'bill run' related", () => {
    describe("because it's nothing to do with bill runs", () => {
      it("returns 'null'", async () => {
        const result = await RequestBillRunService.go('/test/wrls/invoice-runs/12345', 'get', regime, '12345')

        expect(result).to.be.null()
      })
    })

    describe("because it's to create a new 'bill run", () => {
      it("returns 'null'", async () => {
        const result = await RequestBillRunService.go('/test/wrls/bill-runs', 'post', regime, null)

        expect(result).to.be.null()
      })
    })
  })
})
