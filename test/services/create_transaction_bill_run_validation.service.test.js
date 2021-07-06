// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'

// Thing under test
import CreateTransactionBillRunValidationService from '../../app/services/create_transaction_bill_run_validation.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Create Transaction Bill Run Validation service', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
  })

  describe("When the 'bill run' is valid", () => {
    it('returns nothing and throws no error', async () => {
      await expect(CreateTransactionBillRunValidationService.go(billRun, billRun.region)).to.not.reject()
    })
  })

  describe("When the 'bill run' is invalid", () => {
    describe("because it's region and the requested transaction's region do not match", () => {
      it('throws an error', async () => {
        const region = 'W'
        const err = await expect(CreateTransactionBillRunValidationService.go(billRun, region)).to.reject(Error)

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(
          `Bill run ${billRun.id} is for region ${billRun.region} but transaction is for region ${region}.`
        )
      })
    })
  })

  describe("When the 'region' is invalid", () => {
    describe("because it's empty", () => {
      it('throws an error', async () => {
        const err = await expect(CreateTransactionBillRunValidationService.go(billRun)).to.reject(Error)

        expect(err).to.be.an.error()
        expect(err.output.payload.message).to.equal(
          `Bill run ${billRun.id} is for region ${billRun.region} but transaction is for region undefined.`
        )
      })
    })
  })
})
