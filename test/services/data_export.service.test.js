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
const { DataExportService } = require('../../app/services')

describe('Data Export service', () => {
  let exportTableStub
  let sendFileStub
  let notifierFake
  let success

  beforeEach(async () => {
    exportTableStub = Sinon.stub(ExportTableService, 'go').callsFake(table => `${table}.csv`)
    sendFileStub = Sinon.stub(SendFileToS3Service, 'go')

    // Create fake functions to stand in place of Notifier.omg() and .omfg()
    notifierFake = { omg: Sinon.fake(), omfg: Sinon.fake() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When exporting succeeds', () => {
    beforeEach(async () => {
      success = await DataExportService.go(notifierFake)
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
      // args[1] of each call is the destination key, so we map them to an array we can check
      const keys = sendFileStub.getCalls().map(call => call.args[1])

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

    it('logs each exported table', async () => {
      const exportedCalls = notifierFake.omg
        .getCalls()
        .filter(call => call.firstArg.startsWith('Exported table'))

      expect(exportedCalls.length).to.equal(8)
    })

    it('logs each sent file', async () => {
      const sentCalls = notifierFake.omg
        .getCalls()
        .filter(call => call.firstArg.startsWith('Sent file'))

      expect(sentCalls.length).to.equal(8)
    })

    it('returns true', async () => {
      expect(success).to.be.true()
    })
  })

  describe('When exporting a file fails', () => {
    beforeEach(async () => {
      exportTableStub.onCall(0).throws()

      success = await DataExportService.go(notifierFake)
    })

    it('logs an error using notifier', async () => {
      expect(notifierFake.omfg.callCount).to.equal(1)
      expect(notifierFake.omfg.firstArg).to.equal('Error exporting table authorised_systems')
    })

    it('does not transfer any files', async () => {
      expect(sendFileStub.callCount).to.equal(0)
    })

    it('returns false', async () => {
      expect(success).to.be.false()
    })
  })

  describe('When sending a file fails', () => {
    beforeEach(async () => {
      sendFileStub.onCall(0).throws()

      success = await DataExportService.go(notifierFake)
    })

    it('logs an error using notifier', async () => {
      expect(notifierFake.omfg.callCount).to.equal(1)
      expect(notifierFake.omfg.firstArg).to.equal('Error sending file authorised_systems.csv')
    })

    it('continues to transfer all files', async () => {
      expect(sendFileStub.callCount).to.equal(8)
    })

    it('returns false', async () => {
      expect(success).to.be.false()
    })
  })
})
