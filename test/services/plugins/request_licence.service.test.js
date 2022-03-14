'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill_run.helper')
const DatabaseHelper = require('../../support/helpers/database.helper')
const GeneralHelper = require('../../support/helpers/general.helper')
const InvoiceHelper = require('../../support/helpers/invoice.helper')
const LicenceHelper = require('../../support/helpers/licence.helper')
const RegimeHelper = require('../../support/helpers/regime.helper')

// Thing under test
const { RequestLicenceService } = require('../../../app/services')
const LicenceModel = require('../../../app/models/licence.model')

describe('Request licence service', () => {
  let regime
  let billRun
  let invoice
  let licence

  const licencePath = id => {
    return `/test/wrls/bill-runs/_/licences/${id}`
  }

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe("When the request is 'licence' related", () => {
    beforeEach(async () => {
      regime = await RegimeHelper.addRegime('wrls', 'WRLS')
      billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), regime.id)
      invoice = await InvoiceHelper.addInvoice(billRun.id, 'CUSTOMER', '2021')
      licence = await LicenceHelper.addLicence(billRun.id, 'LICENCE', invoice.id)
    })

    describe('and is for a valid licence', () => {
      it('returns the licence', async () => {
        const result = await RequestLicenceService.go(licencePath(invoice.id), licence.id)

        expect(result).to.be.an.instanceOf(LicenceModel)
        expect(result.id).to.equal(licence.id)
      })
    })

    describe('but is for an invalid licence', () => {
      describe('because no matching licence exists', () => {
        it('returns null', async () => {
          const unknownLicenceId = GeneralHelper.uuid4()
          const err = await expect(
            RequestLicenceService.go(licencePath(unknownLicenceId), unknownLicenceId)
          ).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(`Licence ${unknownLicenceId} is unknown.`)
        })
      })
    })
  })

  describe("When the request isn't licence related", () => {
    describe("because it's nothing to do with licences", () => {
      it('returns null', async () => {
        const result = await RequestLicenceService.go('/bill-runs/blah', GeneralHelper.uuid4())

        expect(result).to.be.null()
      })
    })
  })
})
