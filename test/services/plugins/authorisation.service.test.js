'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AuthorisedSystemHelper = require('../../support/helpers/authorised_system.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegimeHelper = require('../../support/helpers/regime.helper.js')

// Thing under test
const AuthorisationService = require('../../../app/services/plugins/authorisation.service.js')

describe('Authorisation service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe("When there is no regime 'slug'", () => {
    describe('nor a user', () => {
      it("returns 'authorised' with no regime", async () => {
        const result = await AuthorisationService.go()

        expect(result.authorised).to.equal(true)
        expect(result.regime).to.equal(null)
      })
    })

    describe("but an 'admin' user", () => {
      it("returns 'authorised' with no regime", async () => {
        const user = await AuthorisedSystemHelper.addAdminSystem()
        const result = await AuthorisationService.go(user)

        expect(result.authorised).to.equal(true)
        expect(result.regime).to.equal(null)
      })
    })

    describe("but a 'system' user", () => {
      it("returns 'authorised' with no regime", async () => {
        const user = await AuthorisedSystemHelper.addSystem('1234546789', 'system')
        const result = await AuthorisationService.go(user)

        expect(result.authorised).to.equal(true)
        expect(result.regime).to.equal(null)
      })
    })
  })

  describe("When there is a regime 'slug'", () => {
    describe('but no user', () => {
      it('throws an error', async () => {
        await expect(AuthorisationService.go(null, 'wrls')).to.reject(TypeError)
      })
    })

    describe("and an 'admin' user", () => {
      it("returns 'authorised' with a regime", async () => {
        const user = await AuthorisedSystemHelper.addAdminSystem()
        const result = await AuthorisationService.go(user, 'wrls')

        expect(result.authorised).to.equal(true)
        expect(result.regime).to.contain('id')
      })
    })

    describe("and a 'system' user", () => {
      describe('and the user is authorised for that regime', () => {
        it("returns 'authorised' and a regime", async () => {
          const regime = await RegimeHelper.addRegime('wrls', 'water')
          const user = await AuthorisedSystemHelper.addSystem('1234546789', 'system', [regime])
          const result = await AuthorisationService.go(user, 'wrls')

          expect(result.authorised).to.equal(true)
          expect(result.regime).to.contain('id')
        })
      })

      describe('and the user is not authorised for that regime', () => {
        it("returns 'unauthorised' and no regime", async () => {
          const regime = await RegimeHelper.addRegime('wrls', 'water')
          const user = await AuthorisedSystemHelper.addSystem('1234546789', 'system', [regime])
          const result = await AuthorisationService.go(user, 'cfd')

          expect(result.authorised).to.equal(false)
          expect(result.regime).to.equal(null)
        })
      })
    })
  })
})
