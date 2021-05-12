'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { DatabaseHelper, GeneralHelper } = require('../support/helpers')
const { DataError } = require('objection')

// Thing under test
const { UpdateAuthorisedSystemService } = require('../../app/services')

describe('Update Authorised System service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When there is no matching authorised system', () => {
    it('throws an error', async () => {
      const id = GeneralHelper.uuid4()
      const err = await expect(UpdateAuthorisedSystemService.go(id)).to.reject(Error, `No authorised system found with id ${id}`)

      expect(err).to.be.an.error()
    })
  })

  describe('When an invalid UUID is used', () => {
    it('returns throws an error', async () => {
      const err = await expect(UpdateAuthorisedSystemService.go('123456789')).to.reject(DataError)

      expect(err).to.be.an.error()
    })
  })
})
