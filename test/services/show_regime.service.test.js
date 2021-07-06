// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Test helpers
import AuthorisedSystemHelper from '../support/helpers/authorised_system.helper.js'
import DatabaseHelper from '../support/helpers/database.helper.js'
import GeneralHelper from '../support/helpers/general.helper.js'
import RegimeHelper from '../support/helpers/regime.helper.js'

// Additional dependencies needed
import { DataError } from 'objection'
import RegimeModel from '../../app/models/regime.model.js'

// Thing under test
import ShowRegimeService from '../../app/services/show_regime.service.js'

// Test framework setup
const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

describe('Show Regime service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('When there is a matching regime', () => {
    it('returns a regime', async () => {
      const regime = await RegimeHelper.addRegime('ice', 'Ice')

      const result = await ShowRegimeService.go(regime.id)

      expect(result instanceof RegimeModel).to.equal(true)
      expect(result.id).to.equal(regime.id)
    })

    it('returns a result that includes a list of related authorised systems', async () => {
      const regime = await RegimeHelper.addRegime('ice', 'water')
      await AuthorisedSystemHelper.addSystem('1234546789', 'system1', [regime])
      await AuthorisedSystemHelper.addSystem('987654321', 'system2', [regime])

      const result = await ShowRegimeService.go(regime.id)

      expect(result.authorisedSystems.length).to.equal(2)
      expect(result.authorisedSystems[0].name).to.equal('system1')
    })
  })

  describe('When there is no matching regime', () => {
    it('returns throws an error', async () => {
      const id = GeneralHelper.uuid4()
      const err = await expect(ShowRegimeService.go(id)).to.reject(Error, `No regime found with id ${id}`)

      expect(err).to.be.an.error()
    })
  })

  describe('When an invalid UUID is used', () => {
    it('returns throws an error', async () => {
      const err = await expect(ShowRegimeService.go('123456789')).to.reject(DataError)

      expect(err).to.be.an.error()
    })
  })
})
