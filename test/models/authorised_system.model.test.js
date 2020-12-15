'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { AuthorisedSystemModel } = require('../../app/models')

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
