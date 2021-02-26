'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const { LicenceModel } = require('../../app/models')

describe('Licence Model', () => {
  describe('the $netTotal() method', () => {
    it("returns the result of 'debitLineValue' minus 'creditLineValue'", async () => {
      const instance = LicenceModel.fromJson({ debitLineValue: 10, creditLineValue: 5 })

      expect(instance.$netTotal()).to.equal(5)
    })
  })
})
