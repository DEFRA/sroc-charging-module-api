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
const DatabaseHelper = require('../../../support/helpers/database.helper')
const NewTransactionHelper = require('../../../support/helpers/new_transaction.helper')

const InvoiceModel = require('../../../../app/models/invoice.model')
const TransactionModel = require('../../../../app/models/transaction.model')
const BillRunModel = require('../../../../app/models/bill_run.model')

const BasePresenter = require('../../../../app/presenters/base.presenter')

const { temporaryFilePath } = require('../../../../config/server.config')

// Thing under test
const GenerateSrocTransactionFileService = require('../../../../app/services/files/transactions/generate_sroc_transaction_file.service')

describe('Generate Sroc Transaction File service', () => {
  const filename = 'abcde67890t'
  const filenameWithPath = path.join(temporaryFilePath, filename)

  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const transaction = await NewTransactionHelper.create(null, _srocOverrides())
    billRun = await BillRunModel.query().findOne({ id: transaction.billRunId })

    // Set the file reference and bill run number on the bill run
    await billRun.$query()
      .patch({
        fileReference: filename,
        billRunNumber: 12345
      })

    // Set the transaction reference on the invoice
    await InvoiceModel.query()
      .findOne({ billRunId: transaction.billRunId })
      .patch({ transactionReference: 'TRANSACTION_REF' })
  })

  afterEach(async () => {
    Sinon.restore()
  })

  it('creates a file with the correct content', async () => {
    const returnedFilenameWithPath = await GenerateSrocTransactionFileService.go(billRun, filename)

    const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
    const expectedContent = _expectedContent()

    expect(file).to.equal(expectedContent)
  })

  it('returns the filename and path', async () => {
    const returnedFilenameWithPath = await GenerateSrocTransactionFileService.go(billRun, filename)

    expect(returnedFilenameWithPath).to.equal(filenameWithPath)
  })

  it('excludes invoices without a transaction reference', async () => {
    // Remove the transaction reference
    await InvoiceModel.query().findOne({ billRunId: billRun.id }).patch({ transactionReference: null })
    const returnedFilenameWithPath = await GenerateSrocTransactionFileService.go(billRun, filename)

    const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
    const numberOfLines = _numberOfLines(file)

    // The transaction should be excluded so only the head and tail should be written to the file
    expect(numberOfLines).to.equal(2)
  })

  it('excludes zero-value transactions', async () => {
    // Set the charge value to 0
    await TransactionModel.query().findOne({ billRunId: billRun.id }).patch({ chargeValue: 0 })
    const returnedFilenameWithPath = await GenerateSrocTransactionFileService.go(billRun, filename)

    const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
    const numberOfLines = _numberOfLines(file)

    // The transaction should be excluded so only the head and tail should be written to the file
    expect(numberOfLines).to.equal(2)
  })

  function _expectedContent () {
    // Get today's date using new Date() and convert it to the format we expect using BaseBresenter._formatDate()
    const presenter = new BasePresenter()
    const date = presenter._formatDate(new Date())

    const head = _contentLine(['H', '0000000', 'NAL', 'A', 'I', '67890T', '12345', date])
    const body = _contentLine(['D', '0000001', 'TH230000222', date, 'I', 'TRANSACTION_REF', '', 'GBP', '', date, '', '', '', '', '', '', '', '', '', '772', '', 'ARCA', 'Well at Chigley Town Hall', 'AT', '', 'TONY/TF9222/37', '', '01-APR-2018 - 31-MAR-2019', '100/200', '2.1.145', 'CHARGE_CATEGORY_DESC', '178300', '', '628200, Nene - Water Newton', '125.1 / 322.23 Ml', '78500', '', '', '', '', '1', 'Each', '772'])
    const tail = _contentLine(['T', '0000002', '3', '0', '0'])

    return head.concat(body).concat(tail)
  }

  function _contentLine (contentArray) {
    return contentArray.map(item => `"${item}"`)
      .join(',')
      .concat('\n')
  }

  function _numberOfLines (file) {
    // Split the file into an array by \n
    const splitLines = file.split('\n')

    // Pop the last element from the array then push it back if it contains text
    // This gets rid of the last line if it's empty to ensure the value we return is the number of populated lines
    const lastElement = splitLines.pop()
    if (lastElement) {
      splitLines.push(lastElement)
    }

    return splitLines.length
  }

  function _srocOverrides () {
    return {
      ruleset: 'sroc',
      lineAttr3: '100/200',
      headerAttr4: '2.1.145',
      regimeValue18: 'CHARGE_CATEGORY_DESC',
      headerAttr9: '178300',
      headerAttr2: '1',
      regimeValue11: '1',
      regimeValue19: '1',
      lineAttr2: '01-APR-2018 - 31-MAR-2019',
      headerAttr5: 'true',
      lineAttr11: '628200',
      headerAttr6: 'Nene - Water Newton',
      regimeValue16: 'true',
      regimeValue20: '125.1',
      headerAttr3: '322.23',
      headerAttr7: 'true',
      headerAttr10: '78500'
    }
  }
})
