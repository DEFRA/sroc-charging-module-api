// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'

// Additional dependencies needed
import { UniqueViolationError } from 'db-errors'
import { ValidationError } from 'joi'

// Thing under test
import CreateAuthorisedSystemService from '../../app/services/create_authorised_system.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Create Authorised System service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When the payload contains a valid request', () => {
    const validPayload = (regimes = []) => {
      return {
        clientId: 'i7rnixijjrawj7azzhwwxxxxxx',
        name: 'olmos',
        status: 'active',
        authorisations: regimes
      }
    }

    describe('that contains authorised regimes', () => {
      beforeEach(async () => {
        await RegimeHelper.addRegime('ice', 'Ice')
        await RegimeHelper.addRegime('wind', 'Wind')
        await RegimeHelper.addRegime('fire', 'Fire')
      })

      it('creates a new authorised system', async () => {
        const payload = validPayload(['ice', 'wind', 'fire'])
        const result = await CreateAuthorisedSystemService.go(payload)

        expect(result.id).to.exist()
        expect(result.clientId).to.equal(payload.clientId)
      })

      it('returns a result that includes the regimes', async () => {
        const payload = validPayload(['ice', 'wind', 'fire'])
        const result = await CreateAuthorisedSystemService.go(payload)

        expect(result.id).to.exist()
        expect(result.regimes.length).to.equal(3)
      })
    })

    describe('that contains no authorised regimes', () => {
      it('creates a new authorised system', async () => {
        const payload = validPayload()
        const result = await CreateAuthorisedSystemService.go(payload)

        expect(result.id).to.exist()
        expect(result.clientId).to.equal(payload.clientId)
      })

      it('returns a result that includes no regimes', async () => {
        const payload = validPayload()
        const result = await CreateAuthorisedSystemService.go(payload)

        expect(result.id).to.exist()
        expect(result.regimes.length).to.equal(0)
      })
    })
  })

  describe('When the payload contains an invalid request', () => {
    const invalidPayload = (clientId = 'i7rnixijjrawj7azzhwwxxxxxx', name = 'olmos') => {
      return {
        clientId: clientId,
        name: name,
        status: 'active',
        authorisations: []
      }
    }

    describe("because the 'clientId'", () => {
      describe('is missing', () => {
        it('throws an error', async () => {
          const payload = invalidPayload('')
          const err = await expect(CreateAuthorisedSystemService.go(payload)).to.reject(ValidationError)

          expect(err).to.be.an.error()
        })
      })

      describe('is a duplicate of an existing one', () => {
        it('throws an error', async () => {
          await AuthorisedSystemHelper.addSystem('1234546789', 'system')

          const payload = invalidPayload('1234546789')
          const err = await expect(CreateAuthorisedSystemService.go(payload)).to.reject(UniqueViolationError)

          expect(err).to.be.an.error()
        })
      })
    })

    describe("because the 'name'", () => {
      describe('is missing', () => {
        it('throws an error', async () => {
          const payload = invalidPayload('123456789', '')
          const err = await expect(CreateAuthorisedSystemService.go(payload)).to.reject(ValidationError)

          expect(err).to.be.an.error()
        })
      })

      describe('is a duplicate of an existing one', () => {
        it('throws an error', async () => {
          await AuthorisedSystemHelper.addSystem('987654321', 'system')

          const payload = invalidPayload('1234546789', 'system')
          const err = await expect(CreateAuthorisedSystemService.go(payload)).to.reject(UniqueViolationError)

          expect(err).to.be.an.error()
        })
      })
    })
  })
})
