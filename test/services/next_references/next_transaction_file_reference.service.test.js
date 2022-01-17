'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper, GeneralHelper, RegimeHelper, SequenceCounterHelper } = require('../../support/helpers')
const { NotFoundError } = require('objection')

// Thing under test
const { NextTransactionFileReferenceService } = require('../../../app/services')

describe('Next Transaction File Reference service', () => {
  let regime

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('wrls', 'WRLS')
    await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')
  })

  describe('When a valid region and regime are specified', () => {
    it('returns a correctly formatted file reference', async () => {
      const result = await NextTransactionFileReferenceService.go(regime, 'R', 'presroc')

      expect(result).to.equal('nalri50001')
    })

    describe('the file reference generated', () => {
      describe('increments with each call', () => {
        it('for the same ruleset', async () => {
          const result = await NextTransactionFileReferenceService.go(regime, 'R', 'presroc')
          const secondResult = await NextTransactionFileReferenceService.go(regime, 'R', 'presroc')

          expect(result).endsWith('1')
          expect(secondResult).endsWith('2')
        })

        it('for different rulesets', async () => {
          const result = await NextTransactionFileReferenceService.go(regime, 'R', 'presroc')
          const otherResult = await NextTransactionFileReferenceService.go(regime, 'R', 'sroc')

          expect(result).endsWith('1')
          expect(otherResult).endsWith('2t')
        })
      })

      describe('increments with each call independently for each regime and region', () => {
        let otherRegime

        beforeEach(async () => {
          otherRegime = await RegimeHelper.addRegime('cfd', 'CFD')
          await SequenceCounterHelper.addSequenceCounter(otherRegime.id, 'S')
        })

        it('for the same ruleset', async () => {
          const result = await NextTransactionFileReferenceService.go(regime, 'R', 'presroc')
          const otherResult = await NextTransactionFileReferenceService.go(otherRegime, 'S', 'presroc')

          expect(result).endsWith('1')
          expect(otherResult).endsWith('1')
        })

        it('for different rulesets', async () => {
          const result = await NextTransactionFileReferenceService.go(regime, 'R', 'presroc')
          const otherResult = await NextTransactionFileReferenceService.go(otherRegime, 'S', 'sroc')

          expect(result).endsWith('1')
          expect(otherResult).endsWith('1t')
        })
      })

      it('has a prefix specific to the regime', async () => {
        const otherRegime = await RegimeHelper.addRegime('cfd', 'CFD')
        await SequenceCounterHelper.addSequenceCounter(otherRegime.id, 'S')

        const result = await NextTransactionFileReferenceService.go(regime, 'R', 'presroc')
        const otherResult = await NextTransactionFileReferenceService.go(otherRegime, 'S', 'presroc')

        expect(result).startsWith('nal')
        expect(otherResult).startsWith('cfd')
      })

      it('has the correct suffix for a ruleset', async () => {
        const result = await NextTransactionFileReferenceService.go(regime, 'R', 'sroc')
        const otherResult = await NextTransactionFileReferenceService.go(regime, 'R', 'presroc')

        expect(result).endsWith('t')
        expect(otherResult).endsWith('2')
      })
    })
  })

  describe('When invalid data is specified', () => {
    it('throws an error for an invalid regime', async () => {
      const dummyRegime = { id: GeneralHelper.uuid4(), slug: 'cfd' }

      const err = await expect(
        NextTransactionFileReferenceService.go(dummyRegime, 'R', 'presroc')
      ).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })

    it('throws an error for an invalid region', async () => {
      const err = await expect(
        NextTransactionFileReferenceService.go(regime, 'X', 'presroc')
      ).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })

    it('throws an error for an invalid ruleset', async () => {
      const err = await expect(
        NextTransactionFileReferenceService.go(regime, 'R', 'INVALID')
      ).to.reject(TypeError)

      expect(err).to.be.an.error()
    })
  })
})
