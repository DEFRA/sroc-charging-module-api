'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  DatabaseHelper,
  GeneralHelper,
  InvoiceHelper,
  LicenceHelper,
  NewBillRunHelper
} = require('../support/helpers')

// Thing under test
const { ValidateBillRunLicenceService } = require('../../app/services')

describe('Validate Bill Run Licence service', () => {
  let billRun
  let invoice
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await NewBillRunHelper.addBillRun()
    invoice = await InvoiceHelper.addInvoice(billRun.id, 'CUSTOMER REFERENCE', 2020)
  })

  describe('When a valid bill run ID is supplied', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.addLicence(billRun.id, 'LICENCE', invoice.id)
    })

    describe('and a valid licence ID', () => {
      it('returns `true`', async () => {
        const result = await ValidateBillRunLicenceService.go(billRun.id, licence)

        expect(result).to.be.true()
      })
    })

    describe('and an invalid licence ID', () => {
      describe('because it is not linked to the bill run', () => {
        let otherBillRun

        beforeEach(async () => {
          otherBillRun = await NewBillRunHelper.addBillRun()
        })

        it('throws an error', async () => {
          const err = await expect(ValidateBillRunLicenceService.go(otherBillRun.id, licence)).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(
            `Licence ${licence.id} is not linked to bill run ${otherBillRun.id}.`
          )
        })
      })

      describe('because it belongs to a rebilling invoice', () => {
        let rebillingLicence

        beforeEach(async () => {
          invoice = await InvoiceHelper.addInvoice(
            billRun.id, 'CUSTOMER REFERENCE', 2021, 0, 0, 1, 5000, 0, 1, 0, 5000, GeneralHelper.uuid4(), 'R'
          )
          rebillingLicence = await LicenceHelper.addLicence(billRun.id, 'LICENCE', invoice.id)
        })

        it('throws an error', async () => {
          const err = await expect(ValidateBillRunLicenceService.go(billRun.id, rebillingLicence)).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(
            `Invoice ${invoice.id} was created as part of a rebilling request.`
          )
        })
      })
    })
  })
})
