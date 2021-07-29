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
  NewBillRunHelper,
  NewInvoiceHelper,
  NewLicenceHelper
} = require('../support/helpers')

const { BillRunModel } = require('../../app/models')

// Thing under test
const { ValidateBillRunLicenceService } = require('../../app/services')

describe.only('Validate Bill Run Licence service', () => {
  let billRun
  let invoice
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()

    invoice = await NewInvoiceHelper.addInvoice()
    billRun = await BillRunModel.query().findById(invoice.billRunId)
  })

  describe('When a valid bill run ID is supplied', () => {
    beforeEach(async () => {
      licence = await NewLicenceHelper.addLicence(invoice.id)
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
          invoice = await NewInvoiceHelper.addInvoice(billRun.id, {
            rebilledInvoiceId: GeneralHelper.uuid4(),
            rebilledType: 'R'
          })
          rebillingLicence = await NewLicenceHelper.addLicence(invoice.id)
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
