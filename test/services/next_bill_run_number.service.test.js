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
import NextBillRunNumberService from '../../app/services/next_bill_run_number.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Get Next Sequence Counter service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When a valid region and regime are specified', () => {
    it('returns incremented values', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const result = await NextBillRunNumberService.go(regime.id, 'R')
      const secondResult = await NextBillRunNumberService.go(regime.id, 'R')

      expect(result).to.equal(10001)
      expect(secondResult).to.equal(10002)
    })

    it('only increments the specified region and regime', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const otherRegime = await RegimeHelper.addRegime('other', 'Other')
      await SequenceCounterHelper.addSequenceCounter(otherRegime.id, 'S')

      const result = await NextBillRunNumberService.go(regime.id, 'R')
      const otherResult = await NextBillRunNumberService.go(otherRegime.id, 'S')

      expect(result).to.equal(10001)
      expect(otherResult).to.equal(10001)
    })
  })

  describe('When invalid data is specified', () => {
    it('throws an error for an invalid regime', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const err = await expect(NextBillRunNumberService.go('11111111-1111-1111-1111-111111111111', 'R')).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })

    it('throws an error for an invalid region', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const err = await expect(NextBillRunNumberService.go(regime.id, 'X')).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })
  })
})
