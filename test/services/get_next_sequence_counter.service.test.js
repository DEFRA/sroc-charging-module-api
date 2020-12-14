'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper, RegimeHelper, SequenceCounterHelper } = require('../support/helpers')
// const AuthorisedSystemModel = require('../../app/models/authorised_system.model')
// const { DataError } = require('objection')

// Thing under test
const { GetNextSequenceCounterService } = require('../../app/services')

describe.only('Get Next Sequence Counter service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When a valid region and regime are specified', () => {
    it('returns incremented values', async () => {
      const regime = await RegimeHelper.addRegime('test', 'Test')
      await SequenceCounterHelper.addSequenceCounter(regime.id, 'R')

      const result = await GetNextSequenceCounterService.go(regime.id, 'R')
      const secondResult = await GetNextSequenceCounterService.go(regime.id, 'R')

      expect(result.billRunNumber).to.equal(10001)
      expect(secondResult.billRunNumber).to.equal(10002)
    })
  })
})
