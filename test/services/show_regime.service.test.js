'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { AuthorisedSystemHelper, DatabaseHelper, RegimeHelper } = require('../support/helpers')
const RegimeModel = require('../../app/models/regime.model')
const { DataError } = require('objection')

// Thing under test
const { ShowRegimeService } = require('../../app/services')

describe('Show Regime service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When there is a matching regime', () => {
    it('returns a regime', async () => {
      const regime = await RegimeHelper.addRegime('ice', 'Ice')

      const result = await ShowRegimeService.go(regime.id)

      expect(result instanceof RegimeModel).to.equal(true)
      expect(result.id).to.equal(regime.id)
    })

    it('returns a result that includes a list of related authorised systems', async () => {
      const regime = await RegimeHelper.addRegime('ice', 'water')
      await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
      await AuthorisedSystemHelper.addSystem('987654321', 'system2', [regime])

      const result = await ShowRegimeService.go(regime.id)

      expect(result.authorisedSystems.length).to.equal(2)
      expect(result.authorisedSystems[0].name).to.equal('system1')
    })
  })

  describe('When there is no matching regime', () => {
    it('returns throws an error', async () => {
      const id = 'f0d3b4dc-2cae-11eb-adc1-0242ac120002'
      const err = await expect(ShowRegimeService.go(id)).to.reject(Error, `No regime found with id ${id}`)

      expect(err).to.be.an.error()
    })
  })

  describe('When an invalid UUID is used', () => {
    it('returns throws an error', async () => {
      const err = await expect(ShowRegimeService.go('123456789')).to.reject(DataError)

      expect(err).to.be.an.error()
    })
  })
})
