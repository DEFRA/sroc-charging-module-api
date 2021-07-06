// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import DatabaseHelper from '../support/helpers/database.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'
import SequenceCounterHelper from '../support/helpers/sequence_counter.helper.js'

// Additional dependencies needed
import { NotFoundError } from 'objection'

// Thing under test
import NextTransactionReferenceService from '../../app/services/next_transaction_reference.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Next Transaction Reference service', () => {
  let regime

  beforeEach(async () => {
    await DatabaseHelper.clean()

    regime = await RegimeHelper.addRegime('test', 'Test')
    await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')
  })

  describe('When a valid region and regime are specified', () => {
    describe("and the reference is needed for a 'credit note'", () => {
      it('returns a correctly formatted transaction reference', async () => {
        const result = await NextTransactionReferenceService.go(regime.id, 'R', 'C')

        expect(result).to.equal('RAC1000001')
      })
    })

    describe("and the reference is needed for an 'invoice'", () => {
      it('returns a correctly formatted transaction reference', async () => {
        const result = await NextTransactionReferenceService.go(regime.id, 'R', 'I')

        expect(result).to.equal('RAI1000001')
      })
    })

    describe('the transaction reference generated', () => {
      it('increments with each call', async () => {
        const result = await NextTransactionReferenceService.go(regime.id, 'R', 'I')
        const secondResult = await NextTransactionReferenceService.go(regime.id, 'R', 'C')

        // The call to slice(-1) grabs the last character from the returned string
        expect(result.slice(-1)).to.equal('1')
        expect(secondResult.slice(-1)).to.equal('2')
      })

      it('increments with each call independently for each regime & region', async () => {
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
      const err = await expect(
        NextTransactionReferenceService.go('11111111-1111-1111-1111-111111111111', 'R', 'I')
      ).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })

    it('throws an error for an invalid region', async () => {
      const err = await expect(
        NextTransactionReferenceService.go(regime.id, 'X', 'C')
      ).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })
  })
})
