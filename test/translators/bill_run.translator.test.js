'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { ValidationError } = require('joi')

// Thing under test
const { BillRunTranslator } = require('../../app/translators')

describe('Bill Run translator', () => {
  const payload = {
    region: 'A'
  }

  const data = (
    payload,
    regimeId = 'ff75f82d-d56f-4807-9cad-12f23d6b29a8',
    authorisedSystemId = 'e46b816a-3fe8-438a-a3f9-7a1a8eb525ce'
  ) => {
    return {
      regimeId,
      authorisedSystemId,
      ...payload
    }
  }

  describe('Default values', () => {
    it("defaults 'status' to 'initialised'", async () => {
      const testTranslator = new BillRunTranslator(data(payload))

      expect(testTranslator.status).to.be.a.string().and.equal('initialised')
    })
  })

  describe('Validation', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', async () => {
        const result = new BillRunTranslator(data(payload))

        expect(result).to.not.be.an.error()
      })

      it("does not throw an error if the 'region' is lowercase", async () => {
        const lowercasePayload = {
          ...payload,
          region: 'a'
        }

        expect(() => new BillRunTranslator(data(lowercasePayload))).to.not.throw()
      })
    })

    describe('when the data is not valid', () => {
      describe("because the 'region' is missing", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            region: ''
          }

          expect(() => new BillRunTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe("because the 'region' is unrecognised", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            ...payload,
            region: 'Z'
          }

          expect(() => new BillRunTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })
    })
  })
})
