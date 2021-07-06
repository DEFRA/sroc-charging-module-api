// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import DatabaseHelper from '../support/helpers/database.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'

// Thing under test
import ListRegimesService from '../../app/services/list_regimes.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('List Regimes service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When there are no regimes', () => {
    it('returns an empty array', async () => {
      const result = await ListRegimesService.go()

      expect(result).to.equal([])
    })
  })

  describe('When there are regimes', () => {
    it('returns them', async () => {
      await RegimeHelper.addRegime('ice', 'Ice')
      await RegimeHelper.addRegime('wind', 'Wind')
      await RegimeHelper.addRegime('fire', 'Fire')

      const result = await ListRegimesService.go()

      expect(result.length).to.equal(3)
      expect(result[0].slug).to.equal('ice')
    })
  })
})
