'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill_run.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const GeneralHelper = require('../../support/helpers/general.helper.js')
const RegimeHelper = require('../../support/helpers/regime.helper.js')

// Thing under test
const RequestBillRunService = require('../../../app/services/plugins/request_bill_run.service.js')

describe('Request bill run service', () => {
  let regime
  let billRun

  const billRunPath = id => {
    return `/test/wrls/bill-runs/${id}`
  }

  const adminPath = id => {
    return `/admin/wrls/bill-runs/${id}`
  }

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), regime.id)
  })

  describe('When the request is bill run related', () => {
    describe('but no matching bill run exists', () => {
      it('throws an error', async () => {
        const unknownBillRunId = GeneralHelper.uuid4()
        const err = await expect(
          RequestBillRunService.go(billRunPath(unknownBillRunId), 'get', regime, unknownBillRunId)
        ).to.reject()

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(`Bill run ${unknownBillRunId} is unknown.`)
      })
    })

    describe('but the bill run is not linked to the regime requested', () => {
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

    describe('and is a GET request', () => {
      it('returns the matching bill run', async () => {
        const result = await RequestBillRunService.go(billRunPath(billRun.id), 'get', regime, billRun.id)

        expect(result.id).to.equal(billRun.id)
      })
    })

    describe('and is a PATCH request', () => {
      describe('for a patchable bill run', () => {
        beforeEach(async () => {
          await billRun.$query().patch({ status: 'approved' })
        })

        it('returns the matching bill run', async () => {
          const result = await RequestBillRunService.go(billRunPath(billRun.id), 'patch', regime, billRun.id)

          expect(result.id).to.equal(billRun.id)
        })
      })

      describe('for an unpatchable bill run', () => {
        beforeEach(async () => {
          await billRun.$query().patch({ status: 'pending' })
        })

        it('throws an error', async () => {
          const err = await expect(
            RequestBillRunService.go(billRunPath(billRun.id), 'patch', regime, billRun.id)
          ).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message)
            .to
            .equal(`Bill run ${billRun.id} cannot be patched because its status is ${billRun.status}.`)
        })

        describe('but the path contains `/admin/`', () => {
          it('returns the matching bill run', async () => {
            const result = await RequestBillRunService.go(adminPath(billRun.id), 'patch', regime, billRun.id)

            expect(result.id).to.equal(billRun.id)
          })
        })
      })
    })

    describe('and is a POST request', () => {
      describe('for an editable bill run', () => {
        beforeEach(async () => {
          await billRun.$query().patch({ status: 'generated' })
        })

        it('returns the matching bill run', async () => {
          const result = await RequestBillRunService.go(billRunPath(billRun.id), 'post', regime, billRun.id)

          expect(result.id).to.equal(billRun.id)
        })
      })

      describe('for an uneditable bill run', () => {
        beforeEach(async () => {
          await billRun.$query().patch({ status: 'approved' })
        })

        it('throws an error', async () => {
          const err = await expect(
            RequestBillRunService.go(billRunPath(billRun.id), 'post', regime, billRun.id)
          ).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message)
            .to
            .equal(`Bill run ${billRun.id} cannot be edited because its status is ${billRun.status}.`)
        })
      })
    })

    describe('and is a DELETE request', () => {
      describe('for an editable bill run', () => {
        beforeEach(async () => {
          await billRun.$query().patch({ status: 'generated' })
        })

        it('returns the matching bill run', async () => {
          const result = await RequestBillRunService.go(billRunPath(billRun.id), 'delete', regime, billRun.id)

          expect(result.id).to.equal(billRun.id)
        })
      })

      describe('for an uneditable bill run', () => {
        beforeEach(async () => {
          await billRun.$query().patch({ status: 'approved' })
        })

        it('throws an error', async () => {
          const err = await expect(
            RequestBillRunService.go(billRunPath(billRun.id), 'delete', regime, billRun.id)
          ).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message)
            .to
            .equal(`Bill run ${billRun.id} cannot be edited because its status is ${billRun.status}.`)
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

      describe('and the path contains `/admin/`', () => {
        it("returns 'null'", async () => {
          const result = await RequestBillRunService.go('/admin/wrls/invoice-runs/12345', 'get', regime, '12345')

          expect(result).to.be.null()
        })
      })
    })

    describe("because it's to create a new bill run (no trailing slash in url)", () => {
      it("returns 'null'", async () => {
        const result = await RequestBillRunService.go('/test/wrls/bill-runs', 'post', regime, null)

        expect(result).to.be.null()
      })
    })
  })
})
