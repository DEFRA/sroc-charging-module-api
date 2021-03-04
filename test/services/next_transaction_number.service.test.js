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
const { NextTransactionNumberService } = require('../../app/services')

describe.only('Next Transaction Number service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When a valid region and regime are specified', () => {
    it('returns incremented values', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const result = await NextTransactionNumberService.go(regime.id, 'R')
      const secondResult = await NextTransactionNumberService.go(regime.id, 'R')

      expect(result).to.equal(1)
      expect(secondResult).to.equal(2)
    })

    it('only increments the specified region and regime', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const otherRegime = await RegimeHelper.addRegime('other', 'Other')
      await SequenceCounterHelper.addSequenceCounter(otherRegime.id, 'S')

      const result = await NextTransactionNumberService.go(regime.id, 'R')
      const otherResult = await NextTransactionNumberService.go(otherRegime.id, 'S')

      expect(result).to.equal(1)
      expect(otherResult).to.equal(1)
    })
  })

  describe('When invalid data is specified', () => {
    it('throws an error for an invalid regime', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const err = await expect(NextTransactionNumberService.go('11111111-1111-1111-1111-111111111111', 'R')).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })

    it('throws an error for an invalid region', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const err = await expect(NextTransactionNumberService.go(regime.id, 'X')).to.reject(NotFoundError)

      expect(err).to.be.an.error()
    })
  })
})
