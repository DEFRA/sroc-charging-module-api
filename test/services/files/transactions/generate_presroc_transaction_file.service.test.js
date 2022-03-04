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
  DatabaseHelper,
  NewBillRunHelper,
  NewInvoiceHelper,
  NewLicenceHelper,
  NewTransactionHelper
} = require('../../../support/helpers')

const { InvoiceModel, TransactionModel, BillRunModel } = require('../../../../app/models')

const { BasePresenter } = require('../../../../app/presenters')

const { temporaryFilePath } = require('../../../../config/server.config')

// Thing under test
const { GeneratePresrocTransactionFileService } = require('../../../../app/services')

describe('Generate Presroc Transaction File service', () => {
  const filename = 'abcde67890'
  const filenameWithPath = path.join(temporaryFilePath, filename)

  let billRun
  let transaction

  beforeEach(async () => {
    await DatabaseHelper.clean()

    // Create a transaction with line description 'second' for later comparison. We set compensation charge to 'true'
    // to ensure this transaction comes second when checking the compensation charge sort order
    transaction = await NewTransactionHelper.create()

    // Get the bill run
    billRun = await BillRunModel.query().findById(transaction.billRunId)

    // Patch the bill run with file reference and bill run number
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
    const returnedFilenameWithPath = await GeneratePresrocTransactionFileService.go(billRun, filename)

    const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
    const expectedContent = _expectedContent()

    expect(file).to.equal(expectedContent)
  })

  it('returns the filename and path', async () => {
    const returnedFilenameWithPath = await GeneratePresrocTransactionFileService.go(billRun, filename)

    expect(returnedFilenameWithPath).to.equal(filenameWithPath)
  })

  it('excludes invoices without a transaction reference', async () => {
    // Remove the transaction reference
    await InvoiceModel.query().findOne({ billRunId: billRun.id }).patch({ transactionReference: null })
    const returnedFilenameWithPath = await GeneratePresrocTransactionFileService.go(billRun, filename)

    const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
    const numberOfLines = _numberOfLines(file)

    // The transaction should be excluded so only the head and tail should be written to the file
    expect(numberOfLines).to.equal(2)
  })

  it('excludes zero-value transactions', async () => {
    // Set the charge value to 0
    await TransactionModel.query().findOne({ billRunId: billRun.id }).patch({ chargeValue: 0 })
    const returnedFilenameWithPath = await GeneratePresrocTransactionFileService.go(billRun, filename)

    const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')
    const numberOfLines = _numberOfLines(file)

    // The transaction should be excluded so only the head and tail should be written to the file
    expect(numberOfLines).to.equal(2)
  })

  describe('the order of the file content', () => {
    beforeEach(async () => {
      // We clean the db and start again as we want our initial transaction to be different for these tests
      await DatabaseHelper.clean()

      // Create a transaction with line description 'second' for later comparison. We set compensation charge to 'true'
      // to ensure this transaction comes second when checking the compensation charge sort order
      transaction = await NewTransactionHelper.create(null, {
        lineDescription: 'second',
        regimeValue17: 'true'
      })

      // Get the bill run
      billRun = await BillRunModel.query().findById(transaction.billRunId)

      // Patch the bill run with file reference and bill run number
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

    it('is correctly sorted by compensation charge', async () => {
      const newInvoice = await NewInvoiceHelper.create(billRun, { transactionReference: 'TRANSACTION_REF' })
      const newLicence = await NewLicenceHelper.create(newInvoice)
      await NewTransactionHelper.create(newLicence, { regimeValue17: 'false', lineDescription: 'first' })

      const returnedFilenameWithPath = await GeneratePresrocTransactionFileService.go(billRun, filename)
      const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')

      const result = _getLineDescriptions(file)
      expect(result).to.equal(['first', 'second'])
    })

    it('is correctly sorted by licence number', async () => {
      // Create a new invoice and add a licence with a different licence number, then add a transaction to it
      const newInvoice = await NewInvoiceHelper.create(billRun, { transactionReference: 'TRANSACTION_REF' })
      const newLicence = await NewLicenceHelper.create(newInvoice)
      // We set compensation charge to 'true' to match the first transaction we created
      await NewTransactionHelper.create(newLicence, { regimeValue17: 'true', lineAttr1: 'A', lineDescription: 'first' })

      const returnedFilenameWithPath = await GeneratePresrocTransactionFileService.go(billRun, filename)
      const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')

      const result = _getLineDescriptions(file)
      expect(result).to.equal(['first', 'second'])
    })

    it('is correctly sorted by invoice transaction reference', async () => {
      // Create a new invoice with a different transaction reference and add a licence & transaction to it
      const newInvoice = await NewInvoiceHelper.create(billRun, { transactionReference: 'A' })
      const newLicence = await NewLicenceHelper.create(newInvoice)
      // We set compensation charge to 'true' to match the first transaction we created
      await NewTransactionHelper.create(newLicence, { regimeValue17: 'true', lineDescription: 'first' })

      const returnedFilenameWithPath = await GeneratePresrocTransactionFileService.go(billRun, filename)
      const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')

      const result = _getLineDescriptions(file)
      expect(result).to.equal(['first', 'second'])
    })

    it('sorts the fields in the correct order', async () => {
      // For simplicity's sake we clean the db first then create a fresh bill run
      await DatabaseHelper.clean()
      billRun = await NewBillRunHelper.create()

      // Patch the bill run with file reference and bill run number
      await billRun.$query().patch({
        fileReference: filename,
        billRunNumber: 12345
      })

      // Create 2 invoices and licences
      const invoiceA = await NewInvoiceHelper.create(billRun, { transactionReference: 'TRANSACTION_REF_A' })
      const licenceOnInvoiceA = await NewLicenceHelper.create(invoiceA)
      const invoiceB = await NewInvoiceHelper.create(billRun, { transactionReference: 'TRANSACTION_REF_B' })
      const licenceOnInvoiceB = await NewLicenceHelper.create(invoiceB)

      // Create our transactions. We do this in a mixed-up order to ensure that sorting takes place
      await NewTransactionHelper.create(licenceOnInvoiceB, { lineAttr1: 'LICENCE_2', regimeValue17: 'true', lineDescription: 'eighth' })
      await NewTransactionHelper.create(licenceOnInvoiceA, { lineAttr1: 'LICENCE_1', regimeValue17: 'false', lineDescription: 'first' })
      await NewTransactionHelper.create(licenceOnInvoiceB, { lineAttr1: 'LICENCE_2', regimeValue17: 'false', lineDescription: 'seventh' })
      await NewTransactionHelper.create(licenceOnInvoiceA, { lineAttr1: 'LICENCE_1', regimeValue17: 'true', lineDescription: 'second' })
      await NewTransactionHelper.create(licenceOnInvoiceB, { lineAttr1: 'LICENCE_1', regimeValue17: 'true', lineDescription: 'sixth' })
      await NewTransactionHelper.create(licenceOnInvoiceA, { lineAttr1: 'LICENCE_2', regimeValue17: 'false', lineDescription: 'third' })
      await NewTransactionHelper.create(licenceOnInvoiceB, { lineAttr1: 'LICENCE_1', regimeValue17: 'false', lineDescription: 'fifth' })
      await NewTransactionHelper.create(licenceOnInvoiceA, { lineAttr1: 'LICENCE_2', regimeValue17: 'true', lineDescription: 'fourth' })

      const returnedFilenameWithPath = await GeneratePresrocTransactionFileService.go(billRun, filename)
      const file = fs.readFileSync(returnedFilenameWithPath, 'utf-8')

      const result = _getLineDescriptions(file)
      expect(result).to.equal(['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'])
    })
  })

  /**
   * Returns an array of line descriptions from a file in order from the first to the last line.
   *
   * We expect to receive files which are comma-delimited with quotes around each item. For simplicity, we strip all
   * double quotes from the file then split each line by comma. This is therefore unsuitable for test data which
   * contains double quotes or commas.
   */
  function _getLineDescriptions (file) {
    return file
      // Split the file into an array of lines
      .split('\n')
      // Slice the array to remove the head and tail lines. We also exclude the blank line at the end of the file,
      // hence `slice(1, -2)`
      .slice(1, -2)
      // Strip quotes from each line and split by comma
      .map(line => line.replaceAll('"', '').split(','))
      // Finally, extract the line description from each line
      .map(line => line[22])
  }

  function _expectedContent () {
    // Get today's date using new Date() and convert it to the format we expect using BaseBresenter._formatDate()
    const presenter = new BasePresenter()
    const date = presenter._formatDate(new Date())

    const head = _contentLine(['H', '0000000', 'NAL', 'A', 'I', '67890', '12345', date])
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
