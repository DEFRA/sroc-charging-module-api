'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { BaseNextFileReferenceService } = require('../../app/services')

class TestService extends BaseNextFileReferenceService { }

describe('Base Next File Reference service', () => {
  describe('When a service extends it', () => {
    it("must override the '_field()' method", () => {
      const throws = () => {
        TestService._field()
      }

      expect(throws).to.throw("Extending service must implement '_field()'")
    })

    it("must override the '_fileFixedChar()' method", () => {
      const throws = () => {
        TestService._fileFixedChar()
      }

      expect(throws).to.throw("Extending service must implement '_fileFixedChar()'")
    })
  })
})
