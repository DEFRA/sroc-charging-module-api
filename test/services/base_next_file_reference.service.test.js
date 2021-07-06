// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Thing under test
import BaseNextFileReferenceService from '../../app/services/base_next_file_reference.service.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

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
