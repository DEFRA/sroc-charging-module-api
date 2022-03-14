'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AuthorisedSystemHelper = require('../../support/helpers/authorised_system.helper')
const DatabaseHelper = require('../../support/helpers/database.helper')

// Thing under test
const ListAuthorisedSystemsService = require('../../../app/services/authorised_systems/list_authorised_systems.service')

describe('List Authorised Systems service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When there are no authorised systems', () => {
    it('returns an empty array', async () => {
      const result = await ListAuthorisedSystemsService.go()

      expect(result).to.equal([])
    })
  })

  describe('When there are authorised systems', () => {
    it('returns them', async () => {
      await AuthorisedSystemHelper.addSystem('1234546789', 'system1')
      await AuthorisedSystemHelper.addSystem('987654321', 'system2')
      await AuthorisedSystemHelper.addSystem('5432112345', 'system3')

      const result = await ListAuthorisedSystemsService.go()

      expect(result.length).to.equal(3)
      expect(result[0].name).to.equal('system1')
    })
  })
})
