// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Thing under test
import BaseUpsertModel from '../../app/models/base_upsert.model.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

class TestModel extends BaseUpsertModel { }

describe('Base Upsert Model', () => {
  describe('When a class extends it', () => {
    it("must override the '_baseOnInsertObject()' method", () => {
      const throws = () => {
        TestModel._baseOnInsertObject()
      }

      expect(throws).to.throw("Extending class must implement '_baseOnInsertObject()'")
    })

    it("must override the '_onConflictContraints()' method", () => {
      const throws = () => {
        TestModel._onConflictContraints()
      }

      expect(throws).to.throw("Extending class must implement '_onConflictContraints()'")
    })
  })
})
