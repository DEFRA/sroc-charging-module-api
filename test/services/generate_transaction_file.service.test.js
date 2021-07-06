// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// Test helpers
import BillRunHelper from '../support/helpers/bill_run.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import TransactionHelper from '../support/helpers/transaction.helper.js'

// Things we need to stub

// Additional dependencies needed
import BasePresenter from '../../app/presenters/base.presenter.js'
import fs from 'fs'
import InvoiceModel from '../../app/models/invoice.model.js'
import path from 'path'
import ServerConfig from '../../config/server.config'
import TransactionModel from '../../app/models/transaction.model.js'

// Thing under test
import GenerateTransactionFileService from '../../app/services/generate_transaction_file.service.js'

// Test framework setup
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script()
const { expect } = Code

describe('Generate Transaction File service', () => {
  const filename = 'test.txt'
  const filenameWithPath = path.join(ServerConfig.temporaryFilePath, filename)

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

  it('excludes invoices without a transaction reference', async () => {
    // Remove the transaction reference
    await InvoiceModel.query().findOne({ billRunId: billRun.id }).patch({ transactionReference: null })
    const returnedFilenameWithPath = await GenerateTransactionFileService.go(billRun, filename)

    const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
    const numberOfLines = _numberOfLines(file)

    // The transaction should be excluded so only the head and tail should be written to the file
    expect(numberOfLines).to.equal(2)
  })

  it('excludes zero-value transactions', async () => {
    // Set the charge value to 0
    await TransactionModel.query().findOne({ billRunId: billRun.id }).patch({ chargeValue: 0 })
    const returnedFilenameWithPath = await GenerateTransactionFileService.go(billRun, filename)

    const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
    const numberOfLines = _numberOfLines(file)

    // The transaction should be excluded so only the head and tail should be written to the file
    expect(numberOfLines).to.equal(2)
  })

  function _expectedContent () {
    // Get today's date using new Date() and convert it to the format we expect using BaseBresenter._formatDate()
    const presenter = new BasePresenter()
    const date = presenter._formatDate(new Date())

    const head = _contentLine(['H', '0000000', 'NAL', 'A', 'I', 't.txt', '12345', date])
    const body = _contentLine(['D', '0000001', 'TH230000222', date, 'I', 'TRANSACTION_REF', '', 'GBP', '', date, '', '', '', '', '', '', '', '', '', '772', '', 'ARCA', 'Well at Chigley Town Hall', 'A', '', 'TONY/TF9222/37', '01-APR-2018 - 31-MAR-2019', 'null', '1495', '6.22 Ml', '3', '1.6', '0.03', '', '', '', '', '', '', '', '1', 'Each', '772'])
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
})
