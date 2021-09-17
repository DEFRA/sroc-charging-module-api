'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { AuthorisedSystemHelper, DatabaseHelper, GeneralHelper, RegimeHelper } = require('../../support/helpers')
const AuthorisedSystemModel = require('../../../app/models/authorised_system.model')
const { DataError } = require('objection')

// Thing under test
const { ViewAuthorisedSystemService } = require('../../../app/services')

describe('View Authorised System service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When there is a matching authorised system', () => {
    describe("and it's the 'admin'", () => {
      it('returns a result that includes a list of related regimes', async () => {
        const authorisedSystem = await AuthorisedSystemHelper.addAdminSystem()

        const result = await ViewAuthorisedSystemService.go(authorisedSystem.id)

        // The admin user's authorisations are created when it's seeded into the db. So, the AuthorisedSystemHelper
        // automatically handles creating the regime as part of `addAdminSystem()` to replicate how the system would
        // be setup.
        expect(result.regimes.length).to.equal(1)
        expect(result.regimes[0].slug).to.equal('wrls')
      })
    })

    it('returns the matching record', async () => {
      const authorisedSystem = await AuthorisedSystemHelper.addSystem('1234546789', 'system1')

      const result = await ViewAuthorisedSystemService.go(authorisedSystem.id)

      expect(result instanceof AuthorisedSystemModel).to.equal(true)
      expect(result.id).to.equal(authorisedSystem.id)
    })

    it('returns a result that includes a list of related regimes', async () => {
      const regime1 = await RegimeHelper.addRegime('ice', 'Ice')
      const regime2 = await RegimeHelper.addRegime('wind', 'Wind')
      const regime3 = await RegimeHelper.addRegime('fire', 'Fire')

      const authorisedSystem = await AuthorisedSystemHelper
        .addSystem('1234546789', 'system1', [regime1, regime2, regime3])

      const result = await ViewAuthorisedSystemService.go(authorisedSystem.id)

      expect(result.regimes.length).to.equal(3)
      expect(result.regimes[0].slug).to.equal('ice')
    })
  })

  describe('When there is no matching regime', () => {
    it('throws an error', async () => {
      const id = GeneralHelper.uuid4()
      const err = await expect(ViewAuthorisedSystemService.go(id)).to.reject(Error, `No authorised system found with id ${id}`)

      expect(err).to.be.an.error()
    })
  })

  describe('When an invalid UUID is used', () => {
    it('returns throws an error', async () => {
      const err = await expect(ViewAuthorisedSystemService.go('123456789')).to.reject(DataError)

      expect(err).to.be.an.error()
    })
  })
})
