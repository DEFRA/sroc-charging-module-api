'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper')
const RegimeHelper = require('../../support/helpers/regime.helper')
const SequenceCounterHelper = require('../../support/helpers/sequence_counter.helper')
const { NotFoundError } = require('objection')

// Thing under test
const { NextTransactionReferenceService } = require('../../../app/services')

describe('Next Transaction Reference service', () => {
  let regime

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('test', 'Test')
    await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')
  })

  describe('When a valid region and regime are specified', () => {
    describe("and the ruleset provided is 'presroc'", () => {
      describe("and the reference is needed for a 'credit note'", () => {
        it('returns a correctly formatted transaction reference', async () => {
          const result = await NextTransactionReferenceService.go(regime.id, 'R', 'presroc', 'C')

          expect(result).to.equal('RAC1000001')
        })
      })

      describe("and the reference is needed for an 'invoice'", () => {
        it('returns a correctly formatted transaction reference', async () => {
          const result = await NextTransactionReferenceService.go(regime.id, 'R', 'presroc', 'I')

          expect(result).to.equal('RAI1000001')
        })
      })

      describe('the transaction reference generated', () => {
        it('increments with each call', async () => {
          const result = await NextTransactionReferenceService.go(regime.id, 'R', 'presroc', 'I')
          const secondResult = await NextTransactionReferenceService.go(regime.id, 'R', 'presroc', 'C')

          expect(result.endsWith('1')).to.be.true()
          expect(secondResult.endsWith('2')).to.be.true()
        })

        it('increments with each call independently for each regime & region', async () => {
          const otherRegime = await RegimeHelper.addRegime('other', 'Other')
          await SequenceCounterHelper.addSequenceCounter(otherRegime.id, 'S')

          const result = await NextTransactionReferenceService.go(regime.id, 'R', 'presroc')
          const otherResult = await NextTransactionReferenceService.go(otherRegime.id, 'S', 'presroc')

          expect(result.endsWith('1')).to.be.true()
          expect(otherResult.endsWith('1')).to.be.true()
        })
      })
    })

    describe("and the ruleset provided is 'sroc'", () => {
      describe("and the reference is needed for a 'credit note'", () => {
        it('returns a correctly formatted transaction reference', async () => {
          const result = await NextTransactionReferenceService.go(regime.id, 'R', 'sroc', 'C')

          expect(result).to.equal('RAC0000001T')
        })
      })

      describe("and the reference is needed for an 'invoice'", () => {
        it('returns a correctly formatted transaction reference', async () => {
          const result = await NextTransactionReferenceService.go(regime.id, 'R', 'sroc', 'I')

          expect(result).to.equal('RAI0000001T')
        })
      })

      describe('the transaction reference generated', () => {
        it('increments with each call', async () => {
          const result = await NextTransactionReferenceService.go(regime.id, 'R', 'sroc', 'I')
          const secondResult = await NextTransactionReferenceService.go(regime.id, 'R', 'sroc', 'C')

          // The call to slice(-1) grabs the last character from the returned string
          expect(result.endsWith('1T')).to.be.true()
          expect(secondResult.endsWith('2T')).to.be.true()
        })

        it('increments with each call independently for each regime & region', async () => {
          const otherRegime = await RegimeHelper.addRegime('other', 'Other')
          await SequenceCounterHelper.addSequenceCounter(otherRegime.id, 'S')

          const result = await NextTransactionReferenceService.go(regime.id, 'R', 'sroc')
          const otherResult = await NextTransactionReferenceService.go(otherRegime.id, 'S', 'sroc')

          expect(result.endsWith('1T')).to.be.true()
          expect(otherResult.endsWith('1T')).to.be.true()
        })
      })
    })
  })

  describe('When invalid data is specified', () => {
    it('throws an error for an invalid regime', async () => {
      const err = await expect(
        NextTransactionReferenceService.go('11111111-1111-1111-1111-111111111111', 'R', 'presroc', 'I')
      ).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })

    it('throws an error for an invalid region', async () => {
      const err = await expect(
        NextTransactionReferenceService.go(regime.id, 'X', 'presroc', 'C')
      ).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })

    it('throws an error for an invalid ruleset', async () => {
      const err = await expect(
        NextTransactionReferenceService.go(regime.id, 'R', 'xxxx', 'C')
      ).to.reject(TypeError)

      expect(err).to.be.an.error()
    })
  })
})
