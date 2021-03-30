'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script()
const { expect } = Code

const fs = require('fs')
const path = require('path')

// Test helpers
const {
  BillRunHelper,
  DatabaseHelper,
  GeneralHelper,
  TransactionHelper
} = require('../support/helpers')

const { InvoiceModel } = require('../../app/models')

const { BasePresenter } = require('../../app/presenters')

const { temporaryFilePath } = require('../../config/server.config')

// Thing under test
const { GenerateTransactionFileService } = require('../../app/services')

describe('Generate Transaction File service', () => {
  const filename = 'test.txt'
  const filenameWithPath = path.join(temporaryFilePath, filename)

  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await BillRunHelper.addBillRun(GeneralHelper.uuid4(), GeneralHelper.uuid4())
    billRun.fileReference = filename
    billRun.billRunNumber = 12345

    await TransactionHelper.addTransaction(billRun.id)

    // Set the transaction reference on the invoice
    await InvoiceModel.query().findOne({ billRunId: billRun.id }).patch({ transactionReference: 'TRANSACTION_REF' })
  })

  afterEach(async () => {
    Sinon.restore()
  })

  it('creates a file with the correct content', async () => {
    const returnedFilenameWithPath = await GenerateTransactionFileService.go(billRun, filename)

    const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
    const expectedContent = _expectedContent()

    expect(file).to.equal(expectedContent)
  })

  it('returns the filename and path', async () => {
    const returnedFilenameWithPath = await GenerateTransactionFileService.go(billRun, filename)

    expect(returnedFilenameWithPath).to.equal(filenameWithPath)
  })

  function _expectedContent () {
    // Get today's date using new Date() and convert it to the format we expect using BaseBresenter._formatDate()
    const presenter = new BasePresenter()
    const date = presenter._formatDate(new Date())

    const head = ['"H"', '"0000000"', '"NAL"', '"A"', '"I"', '"t.txt"', '"12345"', `"${date}"`].join(',').concat('\n')
    const body = ['"D"', '"0000001"', '"TH230000222"', '"01-JAN-1970"', '"I"', '"TRANSACTION_REF"', '""', '"GBP"', '""', '"01-JAN-1970"', '""', '""', '""', '""', '""', '""', '""', '""', '""', '"772"', '""', '"ARCA"', '"Well at Chigley Town Hall"', '"A"', '""', '"TONY/TF9222/37"', '"01-APR-2018 - 31-MAR-2019"', '"null"', '"1495"', '"6.22 Ml"', '"3"', '"1.6"', '"0.03"', '""', '""', '""', '""', '""', '""', '""', '"1"', '"Each"', '"772"'].join(',').concat('\n')
    const tail = ['"T"', '"0000002"', '"3"', '"0"', '"0"'].join(',').concat('\n')

    return head.concat(body).concat(tail)
  }
})
