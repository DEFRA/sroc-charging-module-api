'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { AuthorisedSystemHelper, DatabaseHelper, GeneralHelper } = require('../support/helpers')
const { DataError } = require('objection')

// Thing under test
const { UpdateAuthorisedSystemService } = require('../../app/services')

describe('Update Authorised System service', () => {
  let adminAuthSystem

  beforeEach(async () => {
    await DatabaseHelper.clean()

    adminAuthSystem = await AuthorisedSystemHelper.addAdminSystem()
  })

  describe('When an invalid authorised system ID is supplied', () => {
    describe('because there is no matching authorised system', () => {
      it('throws an error', async () => {
        const id = GeneralHelper.uuid4()
        const err = await expect(UpdateAuthorisedSystemService.go(id)).to.reject(Error, `No authorised system found with id ${id}`)

        expect(err).to.be.an.error()
      })
    })

    describe("because it's the admin authorised system", () => {
      it('throws an error', async () => {
        const id = adminAuthSystem.id
        const err = await expect(UpdateAuthorisedSystemService.go(id)).to.reject(Error, 'You cannot update the main admin.')

        expect(err).to.be.an.error()
      })
    })

    describe('because the UUID is invalid', () => {
      it('returns throws an error', async () => {
        const err = await expect(UpdateAuthorisedSystemService.go('123456789')).to.reject(DataError)

        expect(err).to.be.an.error()
      })
    })
  })
})
