'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const { ExportTableService, SendFileToS3Service } = require('../../app/services')

// Thing under test
const { ReportingExportService } = require('../../app/services')

describe.only('Reporting Export service', () => {
  let exportTableStub
  let sendFileStub
  let notifierFake

  beforeEach(async () => {
    exportTableStub = Sinon.stub(ExportTableService, 'go').callsFake(table => `${table}.dat`)
    sendFileStub = Sinon.stub(SendFileToS3Service, 'go')

    // Create a fake function to stand in place of Notifier.omfg()
    notifierFake = { omfg: Sinon.fake() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When exporting succeeds', () => {
    beforeEach(async () => {
      await ReportingExportService.go(notifierFake)
    })

    it('calls ExportTableService with each required table', async () => {
      const exportedTables = exportTableStub.getCalls().map(call => call.firstArg)

      expect(exportTableStub.callCount).to.equal(8)
      expect(exportedTables).to.only.include([
        'authorised_systems',
        'bill_runs',
        'customer_files',
        'exported_customers',
        'invoices',
        'licences',
        'regimes',
        'transactions'
      ])
    })

    it('calls SendFileToS3Service with each required file', async () => {
      const sentTables = sendFileStub.getCalls().map(call => call.firstArg)

      expect(exportTableStub.callCount).to.equal(8)
      expect(sentTables).to.only.include([
        'authorised_systems.csv',
        'bill_runs.csv',
        'customer_files.csv',
        'exported_customers.csv',
        'invoices.csv',
        'licences.csv',
        'regimes.csv',
        'transactions.csv'
      ])
    })

    it('calls SendFileToS3Service with the correct destination keys', async () => {
      const keys = sendFileStub.getCalls().map(call => call.firstArg)

      expect(keys).to.only.include([
        'csv/authorised_systems.csv',
        'csv/bill_runs.csv',
        'csv/customer_files.csv',
        'csv/exported_customers.csv',
        'csv/invoices.csv',
        'csv/licences.csv',
        'csv/regimes.csv',
        'csv/transactions.csv'
      ])
    })
  })

  describe('When exporting fails', () => {
    beforeEach(async () => {
    })
  })
})
