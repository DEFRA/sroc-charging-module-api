'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper, CustomerHelper, RegimeHelper } = require('../support/helpers')

// Thing under test
const { ListCustomerFilesService } = require('../../app/services')

describe('List Customer Files service', () => {
  let regime

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('ice', 'Ice')
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

    it('returns an empty array', async () => {
      const result = await ListCustomerFilesService.go(regime)

      expect(result).to.equal([])
    })
  })

  describe('When there are customer files', () => {
    describe('for the requested regime', () => {
      beforeEach(async () => {
        await CustomerHelper.addCustomerFile(regime, 'A', 'nalac50001')
        await CustomerHelper.addCustomerFile(regime, 'A', 'nalac50002')

        const otherRegime = await RegimeHelper.addRegime('wind', 'Wind')
        await CustomerHelper.addCustomerFile(otherRegime, 'A', 'balac50001')
      })

      it('returns them', async () => {
        const result = await ListCustomerFilesService.go(regime)

        expect(result.length).to.equal(2)
        expect(result[1].fileReference).to.equal('nalac50002')
      })

      it('does not returns records for other regimes', async () => {
        const result = await ListCustomerFilesService.go(regime)
        const filteredResults = result.filter(file => file.fileReference === 'balac50001')

        expect(filteredResults).to.be.empty()
      })
    })
  })
})
