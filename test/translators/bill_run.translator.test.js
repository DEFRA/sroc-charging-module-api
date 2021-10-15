'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { ValidationError } = require('joi')
const { GeneralHelper } = require('../support/helpers')

// Thing under test
const { BillRunTranslator } = require('../../app/translators')

describe('Bill Run translator', () => {
  const payload = {
    region: 'A'
  }

  const data = (
    payload,
    regimeId = GeneralHelper.uuid4(),
    authorisedSystemId = GeneralHelper.uuid4()
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

    it("defaults 'ruleset' to 'sroc'", async () => {
      const testTranslator = new BillRunTranslator(data(payload))

      expect(testTranslator.ruleset).to.be.a.string().and.equal('sroc')
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
          region: 'a'
        }

        expect(() => new BillRunTranslator(data(lowercasePayload))).to.not.throw()
      })
    })

    describe('when the data is not valid', () => {
      describe("because the 'region' is missing", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            region: ''
          }

          expect(() => new BillRunTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe("because the 'region' is unrecognised", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            region: 'Z'
          }

          expect(() => new BillRunTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe("because the 'ruleset' is unrecognised", () => {
        it('throws an error', async () => {
          const invalidPayload = {
            region: 'A',
            ruleset: 'INVALID'
          }

          expect(() => new BillRunTranslator(data(invalidPayload))).to.throw(ValidationError)
        })
      })

      describe('because the payload is empty', () => {
        it('throws an error', async () => {
          const emptyPayload = { }

          expect(() => new BillRunTranslator(data(emptyPayload))).to.throw(ValidationError)
        })
      })
    })
  })
})
