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
const NextBillRunNumberService = require('../../../app/services/next_references/next_bill_run_number.service')

describe('Next Bill Run Number service', () => {
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
