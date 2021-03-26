'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const {
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  TransactionHelper
} = require('../support/helpers')

const { InvoiceModel, TransactionModel, LicenceModel } = require('../../app/models')

// const mockFs = require('mock-fs')

const fs = require('fs')
const path = require('path')

const { temporaryFilePath } = require('../../config/server.config')

// Thing under test
const { TransformRecordsToFileService } = require('../../app/services')

const testTransaction = {
  id: '94420d4e-eb4b-414e-a99d-3cbfd9928a02',
  bill_run_id: '03e8856e-277b-433e-aa51-7eecbcec4d09',
  charge_value: 21528,
  charge_credit: false,
  created_at: '2021-03-24 08:46:41.21913+00',
  updated_at: '2021-03-24 08:46:41.21913+00',
  created_by: '59c74a73-e551-4657-80df-7667a5ebb2bb',
  regime_id: '73b23fda-05cf-49a9-ba19-58ac8f9e6ed7',
  ruleset: 'presroc',
  status: 'unbilled',
  transaction_date: null,
  subject_to_minimum_charge: false,
  minimum_charge_adjustment: false,
  net_zero_value_invoice: false,
  customer_reference: 'A51541393A',
  client_id: null,
  region: 'W',
  line_area_code: 'AGY4N',
  line_description: 'First Part Spray Irrigation Charge SPRAY IRRIGATION AT NORWOOD FARM COBHAM SURREY',
  charge_period_start: '2017-04-01',
  charge_period_end: '2018-03-31',
  charge_financial_year: 2017,
  header_attr_1: null,
  header_attr_2: null,
  header_attr_3: null,
  header_attr_4: null,
  header_attr_5: null,
  header_attr_6: null,
  header_attr_7: null,
  header_attr_8: null,
  header_attr_9: null,
  header_attr_10: null,
  line_attr_1: '28/39/32/0048',
  line_attr_2: '01-APR-2017 - 31-MAR-2018',
  line_attr_3: '245/245',
  line_attr_4: '1495',
  line_attr_5: '1',
  line_attr_6: '9',
  line_attr_7: '1.6',
  line_attr_8: '1',
  line_attr_9: null,
  line_attr_10: null,
  line_attr_11: null,
  line_attr_12: null,
  line_attr_13: '0',
  line_attr_14: '0',
  line_attr_15: null,
  regime_value_1: 'T00013486A28/39/32/0048',
  regime_value_2: null,
  regime_value_3: '1',
  regime_value_4: '245',
  regime_value_5: '245',
  regime_value_6: 'Kielder',
  regime_value_7: 'Summer',
  regime_value_8: 'High',
  regime_value_9: 'false',
  regime_value_10: null,
  regime_value_11: '1',
  regime_value_12: 'false',
  regime_value_13: '0',
  regime_value_14: 'false',
  regime_value_15: 'Midlands',
  regime_value_16: 'false',
  regime_value_17: 'false',
  regime_value_18: null,
  regime_value_19: null,
  regime_value_20: null,
  charge_calculation: 'IGNORE_ME',
  invoice_id: '6a88c3f9-ef2c-4ea7-9582-2a65cf7d5266',
  licence_id: 'f5238030-50c1-4296-adf9-3bd042be6fe4'
}

describe.only('Generate Transaction File service', () => {
  let billRun
  let invoice
  let licence
  let firstTransaction
  let secondTransaction
  let thirdTransaction

  const filename = 'test'

  // We use path.normalize to remove any double forward slashes that occur when assembling the path
  const filenameWithPath = path.normalize(
    path.format({
      dir: temporaryFilePath,
      name: filename,
      ext: '.dat'
    })
  )

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
    billRun.fileReference = 'FILE_REF'

    firstTransaction = await TransactionHelper.addTransaction(billRun.id)
    invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })
    licence = await LicenceModel.query().findOne({ billRunId: billRun.id })
    secondTransaction = await TransactionHelper.addTransaction(billRun.id, { invoiceId: invoice.id, licenceId: licence.id })
    thirdTransaction = await TransactionHelper.addTransaction(billRun.id, { invoiceId: invoice.id, licenceId: licence.id })

    // // Create mock in-memory file system to avoid temp files being dropped in our filesystem
    // mockFs({
    //   tmp: { }
    // })
  })

  afterEach(async () => {
    Sinon.restore()
    // mockFs.restore()
  })

  describe('When writing a file succeeds', () => {
    it.only('creates a file with expected content', async () => {
      const query = TransactionModel.query().select('*')

      class headerPresenter {
        constructor (data) {
          this.data = data
        }

        go () {
          return {
            col01: '---HEADER---',
            col02: this.data.index
          }
        }
      }

      class bodyPresenter {
        constructor (data) {
          this.data = data
          this.row = 0
        }

        // Note the order, which ensures we're also testing that the order of items is sorted correctly as col01, col02
        go () {
          return {
            col03: this.data.fileReference,
            col02: this.data.billRunId,
            col04: this.data.invoiceId,
            col01: this.data.id,
            col05: this.data.index
          }
        }
      }

      class footerPresenter {
        constructor (data) {
          this.data = data
        }

        go () {
          return {
            col01: '---FOOTER---',
            col02: this.data.index
          }
        }
      }

      const additionalData = {
        fileReference: billRun.fileReference,
        billRunNumber: billRun.billRunNumber,
        transactionReference: invoice.transactionReference
      }

      await TransformRecordsToFileService.go(billRun, query, headerPresenter, bodyPresenter, footerPresenter, filename, additionalData)

      const file = fs.readFileSync(filenameWithPath, 'utf-8')

      const header = ['---HEADER---', 0].join().concat('\n')
      const bodyFirstRow = [firstTransaction.id, firstTransaction.billRunId, billRun.fileReference, invoice.id, 1].join().concat('\n')
      const bodySecondRow = [secondTransaction.id, secondTransaction.billRunId, billRun.fileReference, invoice.id, 2].join().concat('\n')
      const bodyThirdRow = [thirdTransaction.id, thirdTransaction.billRunId, billRun.fileReference, invoice.id, 3].join().concat('\n')
      const body = bodyFirstRow.concat(bodySecondRow).concat(bodyThirdRow)
      const footer = ['---FOOTER---', 4].join().concat('\n')

      expect(file).to.equal(header.concat(body).concat(footer))
    })

    // it('returns the filename and path', async () => {
    //   const returnedFilenameWithPath = await GenerateTransactionFileService.go(filename)

    //   expect(returnedFilenameWithPath).to.equal(filenameWithPath)
    // })
  })

  // describe('When writing a file fails', () => {
  //   it('throws an error', async () => {
  //     const fakeFile = path.format({
  //       dir: 'FAKE_DIR',
  //       name: 'FAKE_FILE'
  //     })

  //     const err = await expect(GenerateTransactionFileService.go(fakeFile)).to.reject()

  //     expect(err).to.be.an.error()
  //     expect(err.message).to.include('ENOENT, no such file or directory')
  //   })
  // })
})
