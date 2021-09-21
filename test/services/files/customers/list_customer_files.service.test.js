'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper, CustomerHelper, GeneralHelper, RegimeHelper } = require('../../../support/helpers')

// Thing under test
const { ListCustomerFilesService } = require('../../../../app/services')

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
        const result = await ListCustomerFilesService.go(regime)

        expect(result).to.equal([])
      })
    })

    describe('for any regimes', () => {
      it('returns an empty array', async () => {
        const result = await ListCustomerFilesService.go(regime)

        expect(result).to.equal([])
      })
    })
  })

  describe('When there are customer files', () => {
    let todayFile
    let yesterdayFile
    let lastWeekFile
    let tooOldFile
    let initialisedFile
    let otherRegimeFile

    describe('for the requested regime', () => {
      beforeEach(async () => {
        todayFile = await CustomerHelper.addCustomerFile(regime, 'A', 'nalac50001', 'exported')
        yesterdayFile = await CustomerHelper.addCustomerFile(regime, 'A', 'nalac50002', 'exported', GeneralHelper.daysAgoDate(1))
        lastWeekFile = await CustomerHelper.addCustomerFile(regime, 'A', 'nalac50003', 'exported', GeneralHelper.daysAgoDate(7))
        tooOldFile = await CustomerHelper.addCustomerFile(regime, 'A', 'nalac50004', 'exported', GeneralHelper.daysAgoDate(31))
        initialisedFile = await CustomerHelper.addCustomerFile(regime, 'A', 'nalac50005', 'initialised')

        const otherRegime = await RegimeHelper.addRegime('other', 'Other')
        otherRegimeFile = await CustomerHelper.addCustomerFile(otherRegime, 'A', 'nalac50006', 'exported')
      })

      it('returns files exported in the last 30 days', async () => {
        const customerFiles = await ListCustomerFilesService.go(regime)
        const result = customerFiles.map(file => file.fileReference)

        expect(result).to.include([
          todayFile.fileReference,
          yesterdayFile.fileReference,
          lastWeekFile.fileReference
        ])
        expect(result).to.not.include(tooOldFile.fileReference)
      })

      it('does not return records for other regimes', async () => {
        const customerFiles = await ListCustomerFilesService.go(regime)
        const result = customerFiles.map(file => file.fileReference)

        expect(result).to.not.include(otherRegimeFile.fileReference)
      })

      it('only returns exported files', async () => {
        const customerFiles = await ListCustomerFilesService.go(regime)
        const result = customerFiles.map(file => file.fileReference)

        expect(result).to.not.include(initialisedFile.fileReference)
      })
    })
  })
})
