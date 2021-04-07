'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper, GeneralHelper, RegimeHelper, SequenceCounterHelper } = require('../support/helpers')
const { NotFoundError } = require('objection')

// Thing under test
const { NextCustomerFileReferenceService } = require('../../app/services')

describe('Next Customer File Reference service', () => {
  let regime

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')
  })

  describe('When a valid region and regime are specified', () => {
    it('returns a correctly formatted file reference', async () => {
      const result = await NextCustomerFileReferenceService.go(regime, 'R')

      expect(result).to.equal('nalrc50001')
    })

    describe('the file reference generated', () => {
      it('increments with each call', async () => {
        const result = await NextCustomerFileReferenceService.go(regime, 'R')
        const secondResult = await NextCustomerFileReferenceService.go(regime, 'R')

        // The call to slice(-1) grabs the last character from the returned string
        expect(result.slice(-1)).to.equal('1')
        expect(secondResult.slice(-1)).to.equal('2')
      })

      it('increments with each call independently for each regime & region', async () => {
        const otherRegime = await RegimeHelper.addRegime('cfd', 'CFD')
        await SequenceCounterHelper.addSequenceCounter(otherRegime.id, 'S')

        const result = await NextCustomerFileReferenceService.go(regime, 'R')
        const otherResult = await NextCustomerFileReferenceService.go(otherRegime, 'S')

        // The call to slice(-1) grabs the last character from the returned string
        expect(result.slice(-1)).to.equal('1')
        expect(otherResult.slice(-1)).to.equal('1')
      })

      it('has a prefix specific to the regime', async () => {
        const otherRegime = await RegimeHelper.addRegime('cfd', 'CFD')
        await SequenceCounterHelper.addSequenceCounter(otherRegime.id, 'S')

        const result = await NextCustomerFileReferenceService.go(regime, 'R')
        const otherResult = await NextCustomerFileReferenceService.go(otherRegime, 'S')

        expect(result).startsWith('nal')
        expect(otherResult).startsWith('cfd')
      })
    })
  })

  describe('When invalid data is specified', () => {
    it('throws an error for an invalid regime', async () => {
      const dummyRegime = { id: GeneralHelper.uuid4(), slug: 'cfd' }

      const err = await expect(
        NextCustomerFileReferenceService.go(dummyRegime, 'R')
      ).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })

    it('throws an error for an invalid region', async () => {
      const err = await expect(
        NextCustomerFileReferenceService.go(regime, 'X')
      ).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })
  })
})
