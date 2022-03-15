'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const NewBillRunHelper = require('../../support/helpers/new_bill_run.helper')
const NewInvoiceHelper = require('../../support/helpers/new_invoice.helper')

// Thing under test
const ValidateInvoiceService = require('../../../app/services/invoices/validate_invoice.service.js')

describe('Validate Invoice service', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
    billRun = await NewBillRunHelper.create()
  })

  describe('When a valid bill run is supplied', () => {
    describe('and a valid invoice', () => {
      it('does not throw an error', async () => {
        const validInvoice = await NewInvoiceHelper.create(billRun)

        await expect(ValidateInvoiceService.go(billRun, validInvoice)).to.not.reject()
      })
    })

    describe('and an invalid invoice', () => {
      describe('because it is not linked to the bill run', () => {
        it('throws an error', async () => {
          const invalidInvoice = await NewInvoiceHelper.create()
          const err = await expect(ValidateInvoiceService.go(billRun, invalidInvoice)).to.reject()

          expect(err).to.be.an.error()
          expect(err.output.payload.message).to.equal(
            `Invoice ${invalidInvoice.id} is not linked to bill run ${billRun.id}.`
          )
        })
      })
    })
  })
})
