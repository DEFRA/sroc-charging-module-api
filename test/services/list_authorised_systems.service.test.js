// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'

// Thing under test
import ListAuthorisedSystemsService from '../../app/services/list_authorised_systems.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

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
