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

const fs = require('fs')
const path = require('path')

const { temporaryFilePath } = require('../../config/server.config')

// Thing under test
const { TransformRecordsToFileService } = require('../../app/services')

describe('Transform Records To File service', () => {
  let billRun
  let invoice
  let licence
  let additionalData
  const transactions = []

  const filename = 'test'

  // We use path.normalize to remove any double forward slashes that occur when assembling the path
  const filenameWithPath = path.normalize(
    path.format({
      dir: temporaryFilePath,
      name: filename,
      ext: '.dat'
    })
  )

  class headPresenter {
    constructor (data) {
      this.data = data
    }

    go () {
      return {
        col01: '---HEAD---',
        col02: this.data.headTest,
        col03: this.data.index
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
        col02: this.data.billRunId,
        col04: this.data.invoiceId,
        col03: this.data.bodyTest,
        col01: this.data.id,
        col05: this.data.index
      }
    }
  }

  class tailPresenter {
    constructor (data) {
      this.data = data
    }

    go () {
      return {
        col01: '---TAIL---',
        col02: this.data.tailTest,
        col03: this.data.index
      }
    }
  }

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
    billRun.fileReference = filename

    additionalData = {
      headTest: 'HEAD_TEST',
      bodyTest: 'BODY_TEST',
      tailTest: 'TAIL_TEST'
    }

    // Clear transactions array
    transactions.length = 0

    transactions.push(await TransactionHelper.addTransaction(billRun.id))
    invoice = await InvoiceModel.query().findOne({ billRunId: billRun.id })
    licence = await LicenceModel.query().findOne({ billRunId: billRun.id })
    transactions.push(await TransactionHelper.addTransaction(billRun.id, { invoiceId: invoice.id, licenceId: licence.id }))
    transactions.push(await TransactionHelper.addTransaction(billRun.id, { invoiceId: invoice.id, licenceId: licence.id }))
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('When writing a file succeeds', () => {
    it.only('creates a file with expected content', async () => {
      const query = TransactionModel.query().select('*')

      await TransformRecordsToFileService.go(query, headPresenter, bodyPresenter, tailPresenter, filename, additionalData)

      const file = fs.readFileSync(filenameWithPath, 'utf-8')

      const expectedArray = []

      expectedArray.push('"---HEAD---","HEAD_TEST","0"\n')
      expectedArray.push(`"${transactions[0].id}","${transactions[0].billRunId}","BODY_TEST","${invoice.id}","1"\n`)
      expectedArray.push(`"${transactions[1].id}","${transactions[1].billRunId}","BODY_TEST","${invoice.id}","2"\n`)
      expectedArray.push(`"${transactions[2].id}","${transactions[2].billRunId}","BODY_TEST","${invoice.id}","3"\n`)
      expectedArray.push('"---TAIL---","TAIL_TEST","4"\n')

      const expectedString = expectedArray.join('')

      expect(file).to.equal(expectedString)
    })

    it('returns the filename and path', async () => {
      const query = TransactionModel.query().select('*')

      const returnedFilenameWithPath = await TransformRecordsToFileService.go(query, headPresenter, bodyPresenter, tailPresenter, filename, additionalData)

      expect(returnedFilenameWithPath).to.equal(filenameWithPath)
    })
  })
})
