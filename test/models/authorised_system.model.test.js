// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Thing under test
import AuthorisedSystemModel from '../../app/models/authorised_system.model.js'

// Test framework setup
const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

describe('Authorised System Model', () => {
  describe('the $active() method', () => {
    it("returns 'true' when the status is 'active'", async () => {
      const instance = AuthorisedSystemModel.fromJson({ status: 'active' })

      expect(instance.$active()).to.be.true()
    })

    it("returns 'false' when the status is not 'active'", async () => {
      const instance = AuthorisedSystemModel.fromJson({ status: 'inactive' })

      expect(instance.$active()).to.be.false()
    })
  })
})
