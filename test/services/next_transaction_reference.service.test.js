'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper, RegimeHelper, SequenceCounterHelper } = require('../support/helpers')
const { NotFoundError } = require('objection')

// Thing under test
const { NextTransactionReferenceService } = require('../../app/services')

describe('Next Transaction Reference service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When a valid region and regime are specified', () => {
    describe("and the reference is needed for a 'credit note'", () => {
      it('returns a correctly formatted transaction reference', async () => {
        const regime = await RegimeHelper.addRegime('test', 'Test')
        await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

        const result = await NextTransactionReferenceService.go(regime.id, 'R', 'C')

        expect(result).to.equal('RAC1000001')
      })
    })

    describe("and the reference is needed for an 'invoice'", () => {
      it('returns a correctly formatted transaction reference', async () => {
        const regime = await RegimeHelper.addRegime('test', 'Test')
        await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

        const result = await NextTransactionReferenceService.go(regime.id, 'R', 'I')

        expect(result).to.equal('RAI1000001')
      })
    })

    describe('the transaction reference generated', () => {
      it('increments with each call', async () => {
        const regime = await RegimeHelper.addRegime('test', 'Test')
        await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

        const result = await NextTransactionReferenceService.go(regime.id, 'R', 'I')
        const secondResult = await NextTransactionReferenceService.go(regime.id, 'R', 'C')

        // The call to slice(-1) grabs the last character from the returned string
        expect(result.slice(-1)).to.equal('1')
        expect(secondResult.slice(-1)).to.equal('2')
      })

      it('increments with each call independently for each regime & region', async () => {
        const regime = await RegimeHelper.addRegime('test', 'Test')
        await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

        const otherRegime = await RegimeHelper.addRegime('other', 'Other')
        await SequenceCounterHelper.addSequenceCounter(otherRegime.id, 'S')

        const result = await NextTransactionReferenceService.go(regime.id, 'R')
        const otherResult = await NextTransactionReferenceService.go(otherRegime.id, 'S')

        // The call to slice(-1) grabs the last character from the returned string
        expect(result.slice(-1)).to.equal('1')
        expect(otherResult.slice(-1)).to.equal('1')
      })
    })
  })

  describe('When invalid data is specified', () => {
    it('throws an error for an invalid regime', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const err = await expect(
        NextTransactionReferenceService.go('11111111-1111-1111-1111-111111111111', 'R', 'I')
      ).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })

    it('throws an error for an invalid region', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const err = await expect(
        NextTransactionReferenceService.go(regime.id, 'X', 'C')
      ).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })
  })
})
