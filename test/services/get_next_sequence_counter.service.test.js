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
const { GetNextSequenceCounterService } = require('../../app/services')

describe('Get Next Sequence Counter service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When a valid region and regime are specified', () => {
    it('returns incremented values', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const result = await GetNextSequenceCounterService.go(regime.id, 'R')
      const secondResult = await GetNextSequenceCounterService.go(regime.id, 'R')

      expect(result).to.equal(10001)
      expect(secondResult).to.equal(10002)
    })
  })

  describe('When invalid data is specified', () => {
    it('throws an error for an invalid regime', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const err = await expect(GetNextSequenceCounterService.go('11111111-1111-1111-1111-111111111111', 'R')).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })

    it('throws an error for an invalid region', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const err = await expect(GetNextSequenceCounterService.go(regime.id, 'X')).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })
  })
})
