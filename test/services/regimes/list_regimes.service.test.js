'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegimeHelper = require('../../support/helpers/regime.helper.js')

// Thing under test
const ListRegimesService = require('../../../app/services/regimes/list_regimes.service.js')

describe('List Regimes service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When there are no regimes', () => {
    it('returns an empty array', async () => {
      const result = await ListRegimesService.go()

      expect(result).to.equal([])
    })
  })

  describe('When there are regimes', () => {
    it('returns them', async () => {
      await RegimeHelper.addRegime('ice', 'Ice')
      await RegimeHelper.addRegime('wind', 'Wind')
      await RegimeHelper.addRegime('fire', 'Fire')

      const result = await ListRegimesService.go()

      expect(result.length).to.equal(3)
      expect(result[0].slug).to.equal('ice')
    })
  })
})
