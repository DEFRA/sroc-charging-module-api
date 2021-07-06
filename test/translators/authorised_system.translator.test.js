// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Additional dependencies needed
import { ValidationError } from 'joi'

// Thing under test
import AuthorisedSystemTranslator from '../../app/translators/authorised_system.translator.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

describe('Authorised system translator', () => {
  const payload = {
    clientId: 'i7rnixijjrawj7azzhwwxxxxxx',
    name: 'olmos'
  }

  const data = (payload, regimes) => {
    return {
      ...payload,
      authorisations: regimes
    }
  }

  describe('Default values', () => {
    it("defaults 'status' to 'active'", async () => {
      const testTranslator = new AuthorisedSystemTranslator(data(payload))

      expect(testTranslator.status).to.be.a.string().and.equal('active')
    })

    it("defaults 'admin' to 'false'", async () => {
      const testTranslator = new AuthorisedSystemTranslator(data(payload, ['wrls']))

      expect(testTranslator.admin).to.be.a.boolean().and.equal(false)
    })
  })

  describe('Validation', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', async () => {
        const result = new AuthorisedSystemTranslator(data(payload, ['wrls']))

        expect(result).to.not.be.an.error()
      })

      it('does not throw an error if authorised regimes is empty', async () => {
        const result = new AuthorisedSystemTranslator(data(payload, []))

        expect(result).to.not.be.an.error()
      })
    })

    describe('when the data is not valid', () => {
      describe("because 'clientId' is missing", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            clientId: ''
          }

          expect(() => new AuthorisedSystemTranslator(data(invalidPayload, ['wrls']))).to.throw(ValidationError)
        })
      })

      describe("because 'name' is missing", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            name: ''
          }

          expect(() => new AuthorisedSystemTranslator(data(invalidPayload, ['wrls']))).to.throw(ValidationError)
        })
      })
    })
  })
})
