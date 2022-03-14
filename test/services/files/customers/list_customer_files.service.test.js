'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../../support/helpers/database.helper')
const CustomerHelper = require('../../../support/helpers/customer.helper')
const GeneralHelper = require('../../../support/helpers/general.helper')
const RegimeHelper = require('../../../support/helpers/regime.helper')

// Thing under test
const ListCustomerFilesService = require('../../../../app/services/files/customers/list_customer_files.service')

describe('List Customer Files service', () => {
  let regime

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('regime', 'Regime')
  })

  describe('When there are no customer files', () => {
    describe('for the requested regime', () => {
      beforeEach(async () => {
        await CustomerHelper.addCustomerFile()
      })

      it('returns an empty array', async () => {
        const result = await ListCustomerFilesService.go(regime, 30)

        expect(result).to.equal([])
      })
    })

    describe('for any regimes', () => {
      it('returns an empty array', async () => {
        const result = await ListCustomerFilesService.go(regime, 30)

        expect(result).to.equal([])
      })
    })
  })

  describe('When there are customer files', () => {
    let todayFile
    let yesterdayFile
    let yearAgoFile
    let midnightFile
    let initialisedFile
    let otherRegimeFile
    let todayCustomer
    let yesterdayCustomer
    let yearAgoCustomer

    describe('for the requested regime', () => {
      beforeEach(async () => {
        todayFile = await CustomerHelper.addCustomerFile(regime, 'A', 'nalac50001', 'exported')
        todayCustomer = await CustomerHelper.addExportedCustomer(todayFile, '0DAY')

        yesterdayFile = await CustomerHelper.addCustomerFile(regime, 'A', 'nalac50002', 'exported', GeneralHelper.daysAgoDate(1))
        yesterdayCustomer = await CustomerHelper.addExportedCustomer(yesterdayFile, '1DAY')

        yearAgoFile = await CustomerHelper.addCustomerFile(regime, 'A', 'nalac50003', 'exported', GeneralHelper.daysAgoDate(365))
        yearAgoCustomer = await CustomerHelper.addExportedCustomer(yearAgoFile, '365DAY')

        initialisedFile = await CustomerHelper.addCustomerFile(regime, 'A', 'nalac50004', 'initialised')

        const otherRegime = await RegimeHelper.addRegime('other', 'Other')
        otherRegimeFile = await CustomerHelper.addCustomerFile(otherRegime, 'A', 'nalac50005', 'exported')
        await CustomerHelper.addExportedCustomer(otherRegimeFile, 'OTHER0DAY')

        midnightFile = await CustomerHelper.addCustomerFile(regime, 'A', 'nalac50006', 'exported', GeneralHelper.daysAgoDate(60, 0, 0, 0, 0))
        await CustomerHelper.addCustomerFile(regime, 'A', 'nalac50006', 'initialised')
      })

      it('returns files exported in the specified number of days', async () => {
        const customerFiles = await ListCustomerFilesService.go(regime, 30)
        const result = customerFiles.map(file => file.fileReference)

        expect(result).to.include([
          todayFile.fileReference,
          yesterdayFile.fileReference
        ])
        expect(result).to.not.include(yearAgoFile.fileReference)
      })

      it("returns only today's files if given an argument of 0 days", async () => {
        const customerFiles = await ListCustomerFilesService.go(regime, 0)
        const result = customerFiles.map(file => file.fileReference)

        expect(result).to.include(todayFile.fileReference)
        expect(result).to.not.include([
          yesterdayFile.fileReference,
          yearAgoFile.fileReference
        ])
      })

      it('returns files exported on the specified day', async () => {
        const customerFiles = await ListCustomerFilesService.go(regime, 1)
        const result = customerFiles.map(file => file.fileReference)

        expect(result).to.include(yesterdayFile.fileReference)
      })

      it('returns customer references in the exported files', async () => {
        const customerFiles = await ListCustomerFilesService.go(regime, 30)
        const result = customerFiles.map(file => file.exportedCustomers[0])

        expect(result).to.include([
          todayCustomer.customerReference,
          yesterdayCustomer.customerReference
        ])
        expect(result).to.not.include(yearAgoCustomer.customerReference)
      })

      it('does not return records for other regimes', async () => {
        const customerFiles = await ListCustomerFilesService.go(regime, 30)
        const result = customerFiles.map(file => file.fileReference)

        expect(result).to.not.include(otherRegimeFile.fileReference)
      })

      it('only returns exported files', async () => {
        const customerFiles = await ListCustomerFilesService.go(regime, 30)
        const result = customerFiles.map(file => file.fileReference)

        expect(result).to.not.include(initialisedFile.fileReference)
      })

      it('includes files exported at exactly midnight (ie. 00:00:00.000)', async () => {
        const customerFiles = await ListCustomerFilesService.go(regime, 60)
        const result = customerFiles.map(file => file.fileReference)

        expect(result).to.include(midnightFile.fileReference)
      })
    })
  })
})
