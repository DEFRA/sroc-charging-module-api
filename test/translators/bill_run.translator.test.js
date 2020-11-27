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

describe.only('Bill Run translator', () => {
  const data = region => {
    return {
      region: region
    }
  }

  describe('Validation', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', async () => {
        const region = 'A'

        expect(() => new BillRunTranslator(data(region))).to.not.throw()
      })

      it("does not throw an error if the 'region' is lowercase", async () => {
        const region = 'a'

        expect(() => new BillRunTranslator(data(region))).to.not.throw()
      })
    })

    describe('when the data is not valid', () => {
      describe("because the 'region' is missing", () => {
        it('throws an error', async () => {
          const region = ''

          expect(() => new BillRunTranslator(data(region))).to.throw(ValidationError)
        })
      })

      describe("because the 'region' is unrecognised", () => {
        it('throws an error', async () => {
          const region = 'Z'

          expect(() => new BillRunTranslator(data(region))).to.throw(ValidationError)
        })
      })
    })
  })
})
