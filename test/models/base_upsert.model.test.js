'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const BaseUpsertModel = require('../../app/models/base_upsert.model')

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
