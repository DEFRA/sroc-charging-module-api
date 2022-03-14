'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper')
const GeneralHelper = require('../../support/helpers/general.helper')
const NewBillRunHelper = require('../../support/helpers/new_bill_run.helper')
const NewInvoiceHelper = require('../../support/helpers/new_invoice.helper')
const NewLicenceHelper = require('../../support/helpers/new_licence.helper')

const { BillRunModel } = require('../../../app/models')

// Thing under test
const { ValidateBillRunLicenceService } = require('../../../app/services')

describe('Validate Bill Run Licence service', () => {
  let billRun
  let invoice
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When a valid bill run ID is supplied', () => {
    beforeEach(async () => {
      licence = await NewLicenceHelper.create()
      billRun = await BillRunModel.query().findById(licence.billRunId)
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
          otherBillRun = await NewBillRunHelper.create()
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
          invoice = await NewInvoiceHelper.create(billRun, {
            rebilledInvoiceId: GeneralHelper.uuid4(),
            rebilledType: 'R'
          })
          rebillingLicence = await NewLicenceHelper.create(invoice)
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
