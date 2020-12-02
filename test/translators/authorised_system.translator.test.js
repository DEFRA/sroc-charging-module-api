'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { ValidationError } = require('joi')

// Thing under test
const { AuthorisedSystemTranslator } = require('../../app/translators')

describe('Authorised system translator', () => {
  describe('Validation', () => {
    describe('when the data is valid', () => {
      const validData = regimes => {
        return {
          clientId: 'i7rnixijjrawj7azzhwwxxxxxx',
          name: 'olmos',
          status: 'active',
          authorisations: regimes
        }
      }

      it('does not throw an error', async () => {
        expect(() => new AuthorisedSystemTranslator(validData(['wrls']))).to.not.throw()
      })

      it('does not throw an error if authorised regimes is empty', async () => {
        expect(() => new AuthorisedSystemTranslator(validData([]))).to.not.throw()
      })
    })

    describe('when the data is not valid', () => {
      const invalidData = regimes => {
        return {
          clientId: '',
          name: 'olmos',
          status: 'active',
          authorisations: regimes
        }
      }

      it('throws an error', async () => {
        expect(() => new AuthorisedSystemTranslator(invalidData(['wrls']))).to.throw(ValidationError)
      })
    })

    describe("When the data contains no 'status'", () => {
      const validData = () => {
        return {
          clientId: 'i7rnixijjrawj7azzhwwxxxxxx',
          name: 'olmos',
          authorisations: []
        }
      }

      it("defaults it to 'active'", async () => {
        const translator = new AuthorisedSystemTranslator(validData())

        expect(translator.status).to.equal('active')
      })
    })
  })
})
